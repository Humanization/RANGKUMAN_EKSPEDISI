const expeditionPhotos = {
    tpa: [
        { url: "https://placehold.co/400x400/fef3c7/d97706?text=Foto+TPA+1", alt: "Kegiatan TPA 1" },
        { url: "https://placehold.co/400x400/fef3c7/d97706?text=Foto+TPA+2", alt: "Kegiatan TPA 2" }
    ],
    sd: [
        { url: "https://placehold.co/400x400/d1fae5/059669?text=Foto+SD+1", alt: "Penyuluhan SD 1" },
        { url: "https://placehold.co/400x400/d1fae5/059669?text=Foto+SD+2", alt: "Penyuluhan SD 2" }
    ],
    petani: [
        { url: "https://placehold.co/400x400/ffedd5/c2410c?text=Foto+Petani+1", alt: "Wawancara Petani 1" },
        { url: "https://placehold.co/400x400/ffedd5/c2410c?text=Foto+Petani+2", alt: "Wawancara Petani 2" }
    ],
    jembatan: [
        { url: "https://placehold.co/400x400/e0f2fe/0284c7?text=Foto+Jembatan+1", alt: "Bersih Jembatan 1" },
        { url: "https://placehold.co/400x400/e0f2fe/0284c7?text=Foto+Jembatan+2", alt: "Bersih Jembatan 2" }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    Object.keys(expeditionPhotos).forEach(category => {
        const container = document.getElementById('gallery-' + category);
        if (!container) return;

        const photos = expeditionPhotos[category];
        container.innerHTML = '';

        photos.forEach(photo => {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative group aspect-square rounded-3xl overflow-hidden bg-stone-100 border-3 border-amber-200 shadow-sm';
            
            const img = document.createElement('img');
            img.src = photo.url;
            img.alt = photo.alt;
            img.className = 'w-full h-full object-cover group-hover:scale-110 transition duration-500';
            img.onerror = function() {
                this.src = 'https://placehold.co/400x400/fef3c7/d97706?text=Foto+Tidak+Tersedia';
            };
            
            wrapper.appendChild(img);
            container.appendChild(wrapper);
        });
    });
});
