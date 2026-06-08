import os
import sys
import json
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="Exoplanet Hunter Python Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
model = None
model_ready = False
model_error = None
INPUT_LENGTH = 3197

# Load model_setup from the same directory
import model_setup

def load_model():
    global model, model_ready, model_error
    try:
        import tensorflow as tf
        model_path = model_setup.paths.get("cnn_exoplanets.keras")
        if not model_path:
            raise FileNotFoundError("cnn_exoplanets.keras not found in model paths")
        model = tf.keras.models.load_model(model_path)
        model_ready = True
        print(f"Model loaded successfully from {model_path}", flush=True)
        print(f"Input shape: {model.input_shape}", flush=True)
        print(f"Output shape: {model.output_shape}", flush=True)
    except Exception as e:
        model_error = str(e)
        print(f"Error loading model: {e}", flush=True)

# Load model at startup
load_model()


def load_samples():
    """Load sample light curves from the npz file.

    Uses 'model_input' (already pre-processed by the training pipeline) as the
    flux that gets sent to /predict, and 'raw' for display in the chart.
    """
    try:
        npz_path = model_setup.paths.get("sample_lightcurves.npz")
        if not npz_path:
            return []
        data = np.load(npz_path)

        raw_array = data["raw"]           # shape (N, 3197) — unnormalized, for display
        mi_array = data["model_input"]    # shape (N, 3197, 1) — pre-processed, for inference
        labels_array = data["labels"]     # shape (N,) — 1=exoplanet, 0=non-exoplanet

        print(f"raw shape: {raw_array.shape}", flush=True)
        print(f"model_input shape: {mi_array.shape}", flush=True)
        print(f"labels shape: {labels_array.shape}", flush=True)

        n_samples = min(len(raw_array), 10)
        samples = []
        for i in range(n_samples):
            raw_label = int(labels_array[i])
            is_exo = raw_label == 1
            label = "EXOPLANET" if is_exo else "NON-EXOPLANET"

            # flux: the pre-processed model_input (squeezed to 1D) — sent to /predict
            # raw_flux: the original raw values — used only for chart display
            mi_flux = mi_array[i, :, 0].tolist()   # squeeze channel dim
            raw_flux = raw_array[i].tolist()

            samples.append({
                "id": f"sample_{i}",
                "label": label,
                "flux": mi_flux,
                "raw_flux": raw_flux,
                "description": f"Kepler light curve {'with transit signal' if is_exo else 'without transit signal'}",
                "star_id": f"KIC-{1000000 + i}"
            })
        return samples
    except Exception as e:
        print(f"Error loading samples: {e}", flush=True)
        return []


SAMPLES = load_samples()
print(f"Loaded {len(SAMPLES)} samples", flush=True)


class PredictInput(BaseModel):
    flux: list[float]
    label: Optional[str] = None
    preprocessed: bool = False  # True = already model_input normalized, skip re-normalization


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/model-status")
def model_status():
    if model_ready:
        return {"ready": True, "message": "Model loaded and ready"}
    elif model_error:
        return {"ready": False, "message": f"Model failed to load: {model_error}"}
    else:
        return {"ready": False, "message": "Model is loading..."}


@app.get("/samples")
def get_samples():
    return SAMPLES


@app.post("/predict")
def predict(body: PredictInput):
    if not model_ready:
        if model_error:
            raise HTTPException(status_code=503, detail=f"Model not available: {model_error}")
        raise HTTPException(status_code=503, detail="Model is still loading, please retry")

    flux = np.array(body.flux, dtype=np.float32)

    # Pad or truncate to INPUT_LENGTH
    if len(flux) < INPUT_LENGTH:
        flux = np.pad(flux, (0, INPUT_LENGTH - len(flux)), mode='constant', constant_values=0)
    elif len(flux) > INPUT_LENGTH:
        flux = flux[:INPUT_LENGTH]

    if not body.preprocessed:
        # Normalize raw flux: zero-mean, unit-variance per sample
        mean = np.mean(flux)
        std = np.std(flux)
        if std > 0:
            flux = (flux - mean) / std
        else:
            flux = flux - mean

    # Reshape for CNN: (1, INPUT_LENGTH, 1)
    x = flux.reshape(1, INPUT_LENGTH, 1)

    # Run inference
    preds = model.predict(x, verbose=0)

    # Handle output shape
    if preds.shape[-1] == 1:
        # Binary output (sigmoid)
        prob_exo = float(preds[0][0])
        prob_non = 1.0 - prob_exo
        is_exoplanet = prob_exo >= 0.5
        confidence = prob_exo if is_exoplanet else prob_non
        label = "EXOPLANET" if is_exoplanet else "NON-EXOPLANET"
        probabilities = {"EXOPLANET": prob_exo, "NON-EXOPLANET": prob_non}
    else:
        # Multi-class (softmax) - class 0 = non-exoplanet, class 1 = exoplanet
        prob_non = float(preds[0][0])
        prob_exo = float(preds[0][1])
        is_exoplanet = prob_exo >= prob_non
        confidence = prob_exo if is_exoplanet else prob_non
        label = "EXOPLANET" if is_exoplanet else "NON-EXOPLANET"
        probabilities = {"EXOPLANET": prob_exo, "NON-EXOPLANET": prob_non}

    return {
        "label": label,
        "confidence": confidence,
        "is_exoplanet": is_exoplanet,
        "probabilities": probabilities
    }


if __name__ == "__main__":
    port = int(os.environ.get("PYTHON_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
