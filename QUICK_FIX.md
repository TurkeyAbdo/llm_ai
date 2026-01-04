# Quick Fix for Accelerate Error

The error `ValueError: Using a device_map requires accelerate` means the `accelerate` package is not installed.

## Solution

Install accelerate:

```bash
cd nexusmind
pip install accelerate>=0.25.0
```

Or reinstall all requirements:

```bash
pip install -r requirements.txt
```

The `accelerate` package is required when using `device_map="auto"` with quantized models (bitsandbytes).

