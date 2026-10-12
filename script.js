import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let db, auth;
let isAuthReady = false;

async function initFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        // Listen to auth state changes to guarantee readiness
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                isAuthReady = true;
            } else {
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (e) {
                    console.error("Auth sign-in error:", e);
                }
            }
        });

        // Trigger initial sign in if not logged in yet
        if (!auth.currentUser) {
            if (initialAuthToken) {
                await signInWithCustomToken(auth, initialAuthToken);
            } else {
                await signInAnonymously(auth);
            }
        }
        isAuthReady = true;

        const photosCol = collection(db, 'artifacts', appId, 'public', 'data', 'photos');
        onSnapshot(photosCol, (snapshot) => {
            const photosByCategory = { tpa: [], sd: [], petani: [], jembatan: [] };
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.category && data.imageUrl) {
                    photosByCategory[data.category].push({
                        id: doc.id,
                        url: data.imageUrl,
                        timestamp: data.timestamp || 0
                    });
                }
            });

            Object.keys(photosByCategory).forEach(cat => {
                const container = document.getElementById('gallery-' + cat);
                if (!container) return;

                const photos = photosByCategory[cat];
                photos.sort((a, b) => a.timestamp - b.timestamp);

                if (photos.length > 0) {
                    container.innerHTML = '';
                    photos.forEach(photo => {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'relative group aspect-square rounded-3xl overflow-hidden bg-stone-100 border-3 border-amber-200 shadow-sm';
                        
                        const img = document.createElement('img');
                        img.src = photo.url;
                        img.alt = 'Dokumentasi Ekspedisi';
                        img.className = 'w-full h-full object-cover group-hover:scale-110 transition duration-500';
                        
                        wrapper.appendChild(img);
                        container.appendChild(wrapper);
                    });
                }
            });
        }, (error) => {
            console.error("Firestore sync error:", error);
        });

    } catch (err) {
        console.error("Firebase initialization failed:", err);
    }
}

initFirebase();

window.openUploadModal = function() {
    document.getElementById('uploadModal').classList.remove('hidden');
}

window.closeUploadModal = function() {
    document.getElementById('uploadModal').classList.add('hidden');
    document.getElementById('uploadPassword').value = '';
    document.getElementById('uploadFile').value = '';
}

window.handlePhotoUpload = async function() {
    const password = document.getElementById('uploadPassword').value;
    if (password !== 'rt01hebat') {
        alertBox('❌ Password salah! Password yang benar adalah: rt01hebat');
        return;
    }

    // Ensure database / auth is fully initialized or fallback to sign-in anonymously if needed
    if (!db) {
        alertBox('⏳ Koneksi database sedang disiapkan, coba beberapa saat lagi.');
        return;
    }

    if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
        } catch (e) {
            console.error("Emergency sign-in failed:", e);
            alertBox('⏳ Koneksi database sedang disiapkan, coba beberapa saat lagi.');
            return;
        }
    }

    const category = document.getElementById('uploadCategory').value;
    const fileInput = document.getElementById('uploadFile');

    if (fileInput.files && fileInput.files.length > 0) {
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.innerText = 'Mengupload... ✨';
        uploadBtn.disabled = true;

        try {
            const photosCol = collection(db, 'artifacts', appId, 'public', 'data', 'photos');
            
            for (let file of Array.from(fileInput.files)) {
                const compressedDataUrl = await resizeImage(file);
                await addDoc(photosCol, {
                    category: category,
                    imageUrl: compressedDataUrl,
                    timestamp: Date.now()
                });
            }

            closeUploadModal();
            alertBox('✨ Berhasil menyimpan foto secara permanen di cloud!');
        } catch (e) {
            console.error("Upload error:", e);
            alertBox('❌ Gagal mengupload foto. Ukuran file mungkin terlalu besar.');
        } finally {
            uploadBtn.innerText = 'Tambahkan Foto ✨';
            uploadBtn.disabled = false;
        }
    } else {
        alertBox('⚠️ Silakan pilih minimal satu foto terlebih dahulu.');
    }
}

function resizeImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 500;

                if (width > height && width > maxDim) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else if (height > maxDim) {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.55));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function alertBox(msg) {
    const div = document.createElement('div');
    div.className = 'fixed bottom-6 right-6 z-50 bg-stone-900 text-white font-extrabold px-6 py-4 rounded-2xl shadow-2xl text-sm animate-in fade-in slide-in-from-bottom-4 duration-300 border-2 border-amber-400';
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}
