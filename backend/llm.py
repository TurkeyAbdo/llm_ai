"""LLM integration with Llama-3.2-1B-Instruct optimized for Windows/Linux."""
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import os

class LLMModel:
    def __init__(self):
        """Initialize Llama-3.2-1B-Instruct with robust error handling."""
        self.model_name = "meta-llama/Llama-3.1-8B-Instruct"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # 1. Initialize Tokenizer
        print(f"Loading tokenizer for {self.model_name}...")
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_name,
            trust_remote_code=True
        )
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        
        # 2. Attempt Model Load
        self.model = self._load_model()
        self.model.eval()
        print(f"Model successfully loaded on {self.device}!")

    def _load_model(self):
        """Internal helper to handle quantization logic and Windows compatibility."""
        
        # Configure 4-bit quantization
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )

        if self.device == "cuda":
            try:
                print("Attempting to load model in 4-bit quantization...")
                return AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    quantization_config=quantization_config,
                    device_map="auto",
                    trust_remote_code=True,
                    torch_dtype=torch.float16
                )
            except Exception as e:
                print(f"Quantization failed (likely bitsandbytes Windows issue): {e}")
                print("Falling back to standard FP16 loading on GPU...")
                return AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    device_map="auto",
                    trust_remote_code=True,
                    torch_dtype=torch.float16
                )
        else:
            print("CUDA not detected. Loading on CPU in FP32 mode (this may be slow)...")
            return AutoModelForCausalLM.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                torch_dtype=torch.float32
            ).to(self.device)

    def generate_response(
        self, 
        user_message: str, 
        context: str,
        max_length: int = 512,
        temperature: float = 0.7
    ) -> str:
        """Generate a response using Llama-3-style prompt formatting."""
        system_prompt = "You are a helpful assistant that answers questions based on the provided context."
        
        # Proper Llama-3.2 Chat Template formatting
        prompt = (
            f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n"
            f"{system_prompt}<|eot_id|>"
            f"<|start_header_id|>user<|end_header_id|>\n\n"
            f"Context:\n{context}\n\n"
            f"Question: {user_message}<|eot_id|>"
            f"<|start_header_id|>assistant<|end_header_id|>\n\n"
        )
        
        inputs = self.tokenizer(prompt, return_tensors="pt", truncation=True, max_length=2048)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_length,
                temperature=temperature,
                do_sample=True,
                top_p=0.9,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )
        
        # Only decode the new tokens generated
        generated_tokens = outputs[0][inputs['input_ids'].shape[-1]:]
        response = self.tokenizer.decode(generated_tokens, skip_special_tokens=True)
        
        return response.strip()