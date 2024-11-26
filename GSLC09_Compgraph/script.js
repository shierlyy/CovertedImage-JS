document.addEventListener('DOMContentLoaded', () => {
    localStorage.removeItem('originalImage');
    localStorage.removeItem('transformation');

    const uploadInput = document.getElementById('upload');
    if (uploadInput) {
        uploadInput.value = ''; 
    }
});

if (document.getElementById('imageForm')) {
    const uploadInput = document.getElementById('upload');
    const processButton = document.getElementById('convertButton');
    const transformationSelect = document.getElementById('transformation');

    processButton.addEventListener('click', () => {
        const file = uploadInput.files[0];
        if (!file) {
            alert('Please upload an image first!');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            localStorage.setItem('originalImage', event.target.result);
            localStorage.setItem('transformation', transformationSelect.value); 
        };
        reader.readAsDataURL(file);
    });
}

if (document.getElementById('originalCanvas')) {
    const originalCanvas = document.getElementById('originalCanvas');
    const editedCanvas = document.getElementById('editedCanvas');
    const originalContext = originalCanvas.getContext('2d');
    const editedContext = editedCanvas.getContext('2d');

    const originalImage = localStorage.getItem('originalImage');
    const transformation = localStorage.getItem('transformation'); 

    if (originalImage) {
        const img = new Image();
        img.src = originalImage;

        img.onload = function () {
            const canvasWidth = 300;
            const canvasHeight = 300;

            originalCanvas.width = canvasWidth;
            originalCanvas.height = canvasHeight;
            editedCanvas.width = canvasWidth;
            editedCanvas.height = canvasHeight;

            const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
            const x = (canvasWidth - img.width * scale) / 2; 
            const y = (canvasHeight - img.height * scale) / 2; 

            originalContext.clearRect(0, 0, canvasWidth, canvasHeight); 
            originalContext.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * scale, img.height * scale);

            const imageData = originalContext.getImageData(0, 0, canvasWidth, canvasHeight);
            const editedData = originalContext.createImageData(canvasWidth, canvasHeight);

            if (transformation === 'grayscale') {
                applyGrayscale(imageData, editedData);
            } else if (transformation === 'blur') {
                applyBlur(imageData, editedData);
            }

            editedContext.putImageData(editedData, 0, 0);
        };
    } else {
        alert('No image found. Please go back and upload an image.');
        location.href = './index.html'
    }
}

function applyGrayscale(imageData, editedData) {
    const { data } = imageData;
    const edited = editedData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const grayscale = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        edited[i] = grayscale;   
        edited[i + 1] = grayscale; 
        edited[i + 2] = grayscale; 
        edited[i + 3] = 255; 
    }
}

function applyBlur(imageData, editedData) {
    const { data, width, height } = imageData;
    const edited = editedData.data;

    const getPixel = (x, y) => {
        const index = (y * width + x) * 4;
        return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    };

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            let count = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const nx = x + kx;
                    const ny = y + ky;

                    if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
                        const [pr, pg, pb, pa] = getPixel(nx, ny);
                        r += pr;
                        g += pg;
                        b += pb;
                        a += pa;
                        count++;
                    }
                }
            }

            const index = (y * width + x) * 4;
            edited[index] = r / count;
            edited[index + 1] = g / count;
            edited[index + 2] = b / count;
            edited[index + 3] = a / count;
        }
    }
}
