
const expeditionPhotos = {
    tpa: [
        { url: "images/tpa-1.jpg", alt: "Kegiatan TPA 1" },
        { url: "images/tpa-2.jpg", alt: "Kegiatan TPA 2" }
    ],
    sd: [
        { url: "images/sd-1.jpg", alt: "Penyuluhan SD 1" },
        { url: "images/sd-2.jpg", alt: "Penyuluhan SD 2" }
    ],
    petani: [
        { url: "images/petani-1.jpg", alt: "Wawancara Petani 1" },
        { url: "images/petani-2.jpg", alt: "Wawancara Petani 2" }
    ],
    jembatan: [
        { url: "images/jembatan-1.jpg", alt: "Bersih Jembatan 1" },
        { url: "images/jembatan-2.jpg", alt: "Bersih Jembatan 2" }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    Object.keys(expeditionPhotos).forEach(category => {
        const container = document.getElementById("gallery-" + category);
        if (!container) return;

        const photos = expeditionPhotos[category];
        container.innerHTML = "";

        photos.forEach(photo => {
            const wrapper = document.createElement("div");
            wrapper.className =
                "relative group aspect-square rounded-3xl overflow-hidden bg-stone-100 border-3 border-amber-200 shadow-sm";

            const img = document.createElement("img");
            img.src = photo.url;
            img.alt = photo.alt;
            img.className =
                "w-full h-full object-cover group-hover:scale-110 transition duration-500";

            img.onerror = function () {
                this.onerror = null;
                this.src =
                    "https://placehold.co/400x400/fef3c7/d97706?text=Foto+Tidak+Tersedia";
            };

            wrapper.appendChild(img);
            container.appendChild(wrapper);
        });
    });
});
