Exoplanet Hunter

A web app that uses a convolutional neural network (CNN) trained on NASA Kepler mission data to classify stars as exoplanet hosts or non-hosts from their stellar light curves.

What it does

Kepler detected exoplanets by watching for tiny, repeating dips in a star's brightness caused by a planet passing in front of it — a method called the transit method. This app runs the same detection logic:

1.Select a preloaded Kepler sample or upload your own .csv light curve file
2.The CNN analyzes 3,197 flux measurements from the star
3.The model outputs a binary prediction: EXOPLANET or NON-EXOPLANET
4.The light curve is rendered as an interactive chart so you can see the transit dips

CNN model

![CNN Architecture](https://miro.medium.com/max/3288/1*uAeANQIOQPqWZnnuH-VEyw.jpeg)

File: python-backend/cnn_exoplanets.keras
Input: (None, 3197, 1) — a single flux time-series padded/truncated to 3,197 points
Output: (None, 1) — sigmoid probability; ≥ 0.5 → EXOPLANET, < 0.5 → NON-EXOPLANET
Normalization: zero-mean, unit-variance applied per sample in Python before inference
Training data: NASA Kepler stellar flux observations (sample_lightcurves.npz, 570 labeled light curves; label 1 = exoplanet, 0 = non-exoplanet)

Webapp: https://exoplanet-hunter--hansika2108.replit.app
