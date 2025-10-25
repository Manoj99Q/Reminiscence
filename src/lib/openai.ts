// Hugging Face image generation - optimized for free usage
export async function generateImage(prompt: string): Promise<string> {
  try {
    console.log('🖼️ Generating image with Hugging Face:', prompt);
    console.log('🔑 HF API Key:', process.env.HUGGINGFACE_API_KEY ? 'SET' : 'NOT SET');
    
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error('Hugging Face API key not configured');
    }
    
    // Use Stable Diffusion XL for high-quality images
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: prompt,
        }),
      }
    );

    console.log('📊 HF Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Hugging Face API error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid Hugging Face API token. Please check your token.');
      }
      
      if (response.status === 503) {
        throw new Error('Hugging Face model is loading. Please try again in a few seconds.');
      }
      
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const imageBlob = await response.blob();
    
    // Check if we got an actual image
    if (imageBlob.size === 0) {
      throw new Error('Empty response from Hugging Face');
    }
    
    console.log('✅ Image generated successfully, size:', imageBlob.size, 'bytes');
    
    // Convert blob to data URL for compatibility with existing code
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;
    
    return imageUrl;
  } catch (error) {
    console.error('❌ Error generating image with Hugging Face:', error);
    
    // Fallback to placeholder image
    console.log('🔄 Using placeholder image as fallback');
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`;
  }
} 