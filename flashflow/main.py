import asyncio
import os
import google.generativeai as genai
from pydantic import BaseModel, Field
import base64

# Pydantic models remain the same
class GenerateImagesFromPromptsInput(BaseModel):
    prompts: list[str] = Field(description="A list of text prompts to generate images from.")

class GenerateImagesFromPromptsOutput(BaseModel):
    imageDataUris: list[str] = Field(description="A list of data URIs, each containing a generated image.")

# The model name from the original TypeScript project
IMAGE_MODEL_NAME = "gemini-2.0-flash-preview-image-generation"

async def generate_images_from_prompts(data: GenerateImagesFromPromptsInput) -> GenerateImagesFromPromptsOutput:
    """
    Generates an image for each text prompt using the google-generativeai library directly.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set.")

    genai.configure(api_key=api_key)

    model = genai.GenerativeModel(model_name=IMAGE_MODEL_NAME)

    image_data_uris = []

    for prompt in data.prompts:
        try:
            detailed_prompt = f"A high quality, creative, and vibrant image representing the following concept: {prompt}"

            # The generate_content method is used for all generation.
            # The model name itself dictates the output type.
            response = await model.generate_content_async(detailed_prompt)

            # Based on google-generativeai documentation, image data is in response.parts[0].inline_data
            if response.parts and response.parts[0].inline_data:
                inline_data = response.parts[0].inline_data
                mime_type = inline_data.mime_type
                image_bytes = inline_data.data

                encoded_data = base64.b64encode(image_bytes).decode('utf-8')
                data_uri = f"data:{mime_type};base64,{encoded_data}"
                image_data_uris.append(data_uri)
            else:
                # Handle cases where no image is returned, or the response is text (e.g., a safety rejection)
                error_text = response.text if hasattr(response, 'text') else 'No image data returned.'
                print(f"Image generation for prompt '{prompt}' failed. Reason: {error_text}")
                image_data_uris.append("")

        except Exception as e:
            print(f"An error occurred while generating image for prompt: '{prompt}'. Error: {e}")
            image_data_uris.append("")

    return GenerateImagesFromPromptsOutput(imageDataUris=image_data_uris)

# Main block for testing
async def main():
    if not os.getenv("GEMINI_API_KEY"):
        print("\nERROR: The GEMINI_API_KEY environment variable is not set.")
        print("Please obtain a key from Google AI Studio and set it before running.")
        print("Example: export GEMINI_API_KEY='your_api_key_here'\n")
        return

    print("Running FlashFlow image generation test (using google-generativeai directly)...")

    input_data = GenerateImagesFromPromptsInput(prompts=[
        "a photo of a happy Corgi playing in a field of flowers",
        "an oil painting of a lonely robot sitting on a park bench"
    ])

    print(f"\nInput prompts: {input_data.prompts}")

    try:
        result = await generate_images_from_prompts(input_data)
        print("\nFlow completed!")
        # Check if we got any successful results
        if any(uri for uri in result.imageDataUris):
             print("Successfully generated image data.")
        else:
             print("Failed to generate any images.")
        # To avoid printing huge base64 strings, we'll just print the status for each prompt
        for i, uri in enumerate(result.imageDataUris):
            status = "Success" if uri else "Failure"
            print(f"  - Prompt {i+1}: {status}")

    except Exception as e:
        print(f"\nAn error occurred during the execution: {e}")


if __name__ == "__main__":
    asyncio.run(main())
