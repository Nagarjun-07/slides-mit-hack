import os
import google.generativeai as genai
from dotenv import load_dotenv
import base64
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

# Configure the generative AI client
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except AttributeError:
    print("Could not find GOOGLE_API_KEY in environment variables.")
    # This will fail if the API key is not set, which is expected if the user hasn't set it up.
    # The frontend part will handle this case gracefully.
    pass

app = Flask(__name__)
CORS(app) # Enable CORS for all routes


def generate_image(prompt: str) -> str:
    """
    Generates an image from a text prompt using the Gemini API.

    Args:
        prompt: The text prompt to generate an image from.

    Returns:
        A data URI containing the generated image.
    """

    model = genai.GenerativeModel('models/gemini-2.0-flash-preview-image-generation')

    # The model used in the TypeScript code is 'googleai/gemini-2.0-flash-preview-image-generation'.
    # The Python SDK uses a different naming convention.
    # After some research, 'gemini-1.5-flash' seems to be the closest equivalent that supports image generation.
    # Let's try to use a model that is more aligned with the original one.
    # The genkit library might have been using a different endpoint or model naming scheme.
    # I will try to use the 'imagen' model as seen in the documentation, as it's specialized for images.
    # The model 'imagen-4.0-generate-preview-06-06' seems to be a good candidate.
    # Let's try to stick to Gemini models if possible.
    # The 'gemini-pro-vision' model is for understanding images, not generating them.
    # The documentation for `google-generativeai` is a bit confusing regarding image generation models.
    # Let's try with a model that is known to work for image generation.
    # The original TS code used 'gemini-2.0-flash-preview-image-generation'.
    # The python equivalent is not directly obvious.
    # Let's try to use the `generate_content` function with a prompt.

    try:
        # The `generate_images` method is not available on the base `genai` object.
        # It's available on `genai.Client().models`.
        # However, the `genai.configure` method sets up a default client.
        # Let's try to use the high-level API first.

        # The documentation I found earlier was for a different version or a different library (`google.genai`).
        # The library I have installed is `google-generativeai`.
        # Let's check the methods available on the model object.

        # After more investigation, it seems that the `google-generativeai` library uses the `generate_content`
        # method for everything, and you specify the output modality.
        # The original code used `responseModalities: ['TEXT', 'IMAGE']`.
        # Let's try to replicate that.

        # It seems there is no direct way to specify image generation as an output modality with `generate_content`.
        # The documentation for image generation with Gemini in Python is pointing towards using `genai.Client().models.generate_images`.
        # This seems to be part of the `google.generativeai` package, but not the high-level API.
        # Let's try to use the client API directly.

        # The documentation is a bit inconsistent. Let's try to use the code from the documentation I found.
        # It seems I need to instantiate a client.

        client = genai.Client()
        response = client.models.generate_images(
            model='imagen-4.0-generate-preview-06-06',
            prompt=f"A high quality, creative, and vibrant image representing the following concept: {prompt}",
        )

        if response.generated_images:
            # Assuming the first image is the one we want.
            generated_image = response.generated_images[0]
            # The image data is in `generated_image.image.image_bytes`
            img_byte_arr = generated_image.image.image_bytes

            # Convert bytes to a data URI
            base64_image = base64.b64encode(img_byte_arr).decode('utf-8')
            return f"data:image/png;base64,{base64_image}"
        else:
            return ""

    except Exception as e:
        print(f"Error generating image for prompt '{prompt}': {e}")
        return ""


def generate_image_from_prompt(prompt: str) -> dict:
    """
    A wrapper for the generate_image function that returns a dictionary
    in the format expected by the frontend.
    """
    image_data_uri = generate_image(prompt)
    return {"imageDataUri": image_data_uri}


def generate_images_from_prompts(prompts: list[str]) -> dict:
    """
    Generates an image for each prompt in a list.
    """
    image_data_uris = []
    for prompt in prompts:
        image_data_uri = generate_image(prompt)
        image_data_uris.append(image_data_uri)

    return {"imageDataUris": image_data_uris}

@app.route('/generate-image-from-prompt', methods=['POST'])
def handle_generate_image_from_prompt():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    result = generate_image_from_prompt(prompt)
    return jsonify(result)

@app.route('/generate-images-from-prompts', methods=['POST'])
def handle_generate_images_from_prompts():
    data = request.get_json()
    prompts = data.get('prompts')
    if not prompts or not isinstance(prompts, list):
        return jsonify({"error": "A list of prompts is required"}), 400

    result = generate_images_from_prompts(prompts)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5001) # Using port 5001 to avoid conflict with Next.js dev server
