export async function uploadImageToCloudinary(file) {
  if (!file) {
    throw new Error("Aucune image sélectionnée");
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset || cloudName === "your_cloud_name") {
    throw new Error("Cloudinary n'est pas encore configuré");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Échec du téléchargement de l'image");
  }

  const data = await response.json();
  return data.secure_url;
}