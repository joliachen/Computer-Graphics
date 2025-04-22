from PIL import Image
import os

def crop_to_512(image_path, output_dir=None):

    img = Image.open(image_path)
    
 
    width, height = img.size
    
   
    ratio = 512 / min(width, height)
    

    new_width = int(width * ratio)
    new_height = int(height * ratio)
    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    

    left = (new_width - 512) // 2
    top = (new_height - 512) // 2
    right = left + 512
    bottom = top + 512
    
  
    img = img.crop((left, top, right, bottom))
    

    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, os.path.basename(image_path))
    else:
        name, ext = os.path.splitext(image_path)
        output_path = f"{name}_512{ext}"
    

    img.save(output_path)
    print(f"Saved: {output_path}")



image_path = "nor_flower.png" 
crop_to_512(image_path)