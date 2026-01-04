# Update Instructions

## Fixing Compatibility Issues

If you're experiencing the following errors:

1. **NumPy 2.0 Compatibility Error**: `AttributeError: np.float_ was removed in the NumPy 2.0 release`
2. **Transformers Compatibility Error**: `ValueError: rope_scaling must be a dictionary with two fields`

### Solution

1. **Uninstall incompatible packages:**
   ```bash
   pip uninstall numpy transformers -y
   ```

2. **Install the correct versions:**
   ```bash
   pip install "numpy<2.0.0"
   pip install "transformers>=4.40.0"
   ```

   Or reinstall all requirements:
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify installation:**
   ```bash
   python -c "import numpy; print(numpy.__version__)"  # Should be < 2.0.0
   python -c "import transformers; print(transformers.__version__)"  # Should be >= 4.40.0
   ```

The updated `requirements.txt` now includes:
- `numpy<2.0.0` - Fixes ChromaDB compatibility
- `transformers>=4.40.0` - Fixes Llama-3.2 compatibility


