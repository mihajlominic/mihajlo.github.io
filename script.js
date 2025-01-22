const wrapper = document.getElementById("tiles");

const colors = [
    "rgb(229, 57, 53)",
    "rgb(253, 216, 53)",
    "rgb(244, 81, 30)",
    "rgb(76, 175, 80)",
    "rgb(33, 150, 243)",
    "rgb(156, 39, 176)"
]

let columns = 0,
    rows = 0;

let toggled = false;

const handleOnClick = index => {
   toggled = !toggled;

   document.body.classList.toggle("toggled");
    
    anime({
        targets: ".tile",
        opacity: toggled ? 0 : 1,
        delay: anime.stagger(50, {
            grid: [columns, rows],
            from: index
        })
    });
};


const createTile = index => {
    const tile = document.createElement("div");

    tile.classList.add("tile");

    tile.onclick = e => handleOnClick(index);

    return tile;
}

const createTiles = quantity => {
    Array.from(Array(quantity)).map((tile, index) => {
        wrapper.appendChild(createTile(index));
    })
}

const createGrid = () => {
    wrapper.innerHTML = "";

    columns = Math.floor(document.body.clientWidth / 20);
    rows = Math.floor(document.body.clientHeight / 20);

    wrapper.style.setProperty("--columns", columns);
    wrapper.style.setProperty("--rows", rows);

    createTiles(columns * rows);
}

createGrid();

window.onresize = () => createGrid();


const uploader = document.querySelector(".uploader");
const fileInput = document.getElementById("file-input");
const fileDisplay = document.querySelector(".file-display");
const overlay = document.getElementById("input");
const uploadBTN = document.querySelector(".upload");
const clearButton = document.querySelector(".clear");

// Add event listeners for drag & drop
let dragCounter = 0;

// Add event listeners for drag & drop
document.addEventListener("dragenter", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    overlay.style.display = "flex";
});

document.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter === 0) {
        overlay.style.display = "none";
    }
});

document.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0; // Reset the counter on drop
    overlay.style.display = "none";
    const files = e.dataTransfer.files;
    displayFiles(files);
});

// Handle file input click
uploadBTN.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    const files = fileInput.files;
    displayFiles(files);
});

// Function to display files
function displayFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement("div");
                div.classList.add("file-info");
                div.innerHTML = `
                    <button class="remove-file" title="Remove file">&times;</button>
                    <img src="${e.target.result}" alt="${file.name}" />
                    <p>${file.name}</p>
                `;
                fileDisplay.appendChild(div);

                // Add click event for the remove button
                const removeButton = div.querySelector(".remove-file");
                removeButton.addEventListener("click", (e) => {
                    e.stopPropagation(); // Prevent triggering parent click events
                    div.remove();
                });
            };
            reader.readAsDataURL(file);
        } else {
            const div = document.createElement("div");
            div.classList.add("file-info");
            div.innerHTML = `
                <button class="remove-file" title="Remove file">&times;</button>
                <p>${file.name}</p>
            `;
            fileDisplay.appendChild(div);

            // Add click event for the remove button
            const removeButton = div.querySelector(".remove-file");
            removeButton.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent triggering parent click events
                div.remove();
            });
        }
    });
}

clearButton.addEventListener("click", () => {
    filesToUpload = []; // Clear the files array
    fileDisplay.innerHTML = ""; // Clear the preview
    console.log("Cleared all files");
});
