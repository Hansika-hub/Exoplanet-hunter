# 🔭 Exoplanet Hunter: ML-Powered Exoplanet Detection

## Project Overview

**Exoplanet Hunter** is an intelligent web application that leverages a Convolutional Neural Network (CNN) trained on NASA Kepler mission data to identify exoplanets from stellar light curves. We transform raw astronomical observations into actionable insights, automating a critical step in exoplanet discovery.

> **The Challenge**: Exoplanet detection is a classic needle-in-a-haystack problem. The Kepler mission observed thousands of stars, but less than 1% showed the telltale brightness dips of an orbiting exoplanet. Our solution tackles this extreme class imbalance head-on.

---

## 🚀 What It Does

### Quick Start Flow:
1. **Upload or Select** a Kepler light curve (CSV format or preloaded samples)
2. **Preprocess** the stellar flux data (3,197 measurements per star)
3. **Analyze** using our trained CNN model
4. **Get Results** - Binary classification: **EXOPLANET** ✓ or **NON-EXOPLANET** ✗
5. **Visualize** the light curve with interactive charts to spot transit dips

---

## 🧠 Advanced Processing Pipeline

Our robust multi-stage approach ensures accuracy and reliability:

### Data Preprocessing & Augmentation
Addressing class imbalance is critical. We employ:

| Technique | Purpose |
|-----------|---------|
| **Fourier Transform** | Identify periodic patterns in light curves |
| **Savitzky-Golay Filter** | Smooth noise while preserving signal integrity |
| **Robust Scaling** | Normalize features and handle outliers |
| **SMOTE** | Generate synthetic exoplanet samples to balance dataset |

### Convolutional Neural Network (CNN)
Our 1D CNN architecture is optimized for time-series light curve analysis:

- **Convolutional Layers (Conv1D)**: Detect local patterns (transit signatures) regardless of position
- **Pooling Layers (MaxPooling1D)**: Downsample features while maintaining robustness to pattern shifts
- **Dense Layers**: Map learned features to final classification

---

## 📊 Model Specifications

| Aspect | Details |
|--------|---------|
| **Architecture** | 1D Convolutional Neural Network |
| **Input Shape** | (None, 3197, 1) — 3,197 flux measurements per light curve |
| **Output** | Sigmoid probability; ≥0.5 → EXOPLANET, <0.5 → NON-EXOPLANET |
| **Training Data** | 570 labeled NASA Kepler observations (sample_lightcurves.npz) |
| **Preprocessing** | Zero-mean, unit-variance normalization per sample |
| **Model File** | `python-backend/cnn_exoplanets.keras` |

---

## 📈 Performance

The CNN model achieves **>99% accuracy** on the preprocessed dataset, demonstrating exceptional capability in identifying exoplanet signatures within complex light curve patterns. This automated pipeline dramatically reduces manual review time, allowing astronomers to focus on in-depth analysis of promising candidates.

---

## 🌐 Live Application

**Try it now:** [Exoplanet Hunter Web App](https://exoplanet-hunter--hansika2108.replit.app)

---

*Discovering distant worlds, one light curve at a time. 🌍✨*
