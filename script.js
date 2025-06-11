const images = [
    'image1.jpg', 'image2.jpg', 'image3.jpg', 
    'image4.jpg', 'image5.jpg', 'image6.jpg',
    'image7.jpg', 'image8.jpg', 'image9.jpg', 
    'image10.jpg', 'image11.jpg', 'image12.jpg'
  ]; 
  
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8033', '#33FFD5'];
  let tiles = [];
  let flippedTiles = [];
  let matchedPairs = 0;
  

  let levelData = [];
  let usedQuestions = [];
  let currentQuestionItem = null;
  
  fetch('level1.json')
    .then(res => res.json())
    .then(data => { levelData = data; })
    .catch(err => console.error(err));
  
    
  
  // Shuffle function
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
  let selectedImages;
  // Create the tiles
  const createTiles = () => {
    let allTiles = [];
  
    // Step 1: Pick 3 unique images
    selectedImages = shuffle([...images]).slice(0, 6); // [imgA, imgB, imgC]
  
    // Step 2: Create image pairs
    const imagePairs = shuffle([...selectedImages, ...selectedImages]); // [imgA, imgB, imgC, imgA, imgB, imgC] shuffled
  
    // Step 3: Shuffle colors and assign to each tile
    const shuffledColors = shuffle([...colors]).slice(0, 12);
  
    for (let i = 0; i < 12; i++) {
      allTiles.push({
        color: shuffledColors[i],
        image: imagePairs[i],
      });
    }
  
    // Render tiles
    const gameBoard = document.getElementById('game-board');
    allTiles.forEach((tile, index) => {
      const tileElement = document.createElement('div');
      tileElement.classList.add('tile');
      tileElement.innerHTML = `
        <div class="card">
          <div class="front"></div>
          <div class="back" style="background-image: url(${tile.image});"></div>
        </div>
      `;
      tileElement.addEventListener('click', () => flipTile(tileElement, index));
      gameBoard.appendChild(tileElement);
      tiles.push(tileElement);
    });
  };
  
  // Flip the tile
  const flipTile = (tile, index) => {
    if (flippedTiles.length === 2 || tile.classList.contains('flip')) return;
  
    tile.classList.add('flip');
    flippedTiles.push(index);
  
    if (flippedTiles.length === 2) {
      checkMatch();
    }
  };
  
  // Check for match
  function checkMatch() {
    const [firstTileIndex, secondTileIndex] = flippedTiles;
    const firstTile = tiles[firstTileIndex];
    const secondTile = tiles[secondTileIndex];
  
    const firstImage = firstTile.querySelector('.back').style.backgroundImage;
    const secondImage = secondTile.querySelector('.back').style.backgroundImage;
    const targetImage = `url("${currentQuestionItem.image}")`;
  
    if (firstImage === secondImage && firstImage === targetImage) {
      matchedPairs++;
      flippedTiles = [];
  
      if (matchedPairs === 6) {
        // Wait for two frames so the flip can visually complete
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            alert("You win!");
          });
        });
      } else {
        setTimeout(() => {
          setNewQuestion();
        }, 500);
      }
    } else {
      setTimeout(() => {
        firstTile.classList.remove('flip');
        secondTile.classList.remove('flip');
        flippedTiles = [];
      }, 1000);
    }
  }
  

  document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('start-screen').style.display = 'none';
    // Flip all tiles at the start
    setTimeout(() => {
        const tileElements = document.querySelectorAll('.tile');
        const imageMap = {};

        // Group tiles by background image
        tileElements.forEach(tile => {
            const image = tile.querySelector('.back').style.backgroundImage;
            if (!imageMap[image]) {
            imageMap[image] = [];
            }
            imageMap[image].push(tile);
        });

        // Flip one tile from each pair
        Object.values(imageMap).forEach(pair => {
            if (pair.length >= 1) {
            const randomIndex = Math.floor(Math.random() * pair.length);
            pair[randomIndex].classList.add('flip');
            }
        });
      }, 900); // wait a bit so user sees the last tile flip

      setTimeout(() => {
        showStudyScreenWithImages(selectedImages);
      }, 2500);
      
    
  });

  // Disable the study button initially
  const openStudyBtn = document.getElementById('open-study-button');
  openStudyBtn.disabled = true;
  openStudyBtn.style.opacity = '0';

  // Enable after first close of study screen
  const originalCloseStudy = document.getElementById('close-study').onclick;
  document.getElementById('close-study').addEventListener('click', () => {
    openStudyBtn.disabled = false;
    openStudyBtn.style.opacity = '1';
  }, { once: true });

  // Trigger overlay when Study button is clicked
  openStudyBtn.addEventListener('click', () => {
    document.getElementById('question-overlay').classList.remove('visible');
    const studyScreen = document.getElementById('study-screen');
    openStudyBtn.style.opacity = '0';
    studyScreen.classList.remove('hidden');
    requestAnimationFrame(() => {
      studyScreen.classList.add('show');
    });
  });


  function showStudyScreenWithImages(imageList) {
     const studyScreen = document.getElementById('study-screen');
     const studyItems = studyScreen.querySelector('#study-items');
  
     studyItems.innerHTML = ''; // Clear previous
  
    // For each flipped image URL, find its data in levelData
     imageList.forEach(imgUrl => {
       // Find the JSON entry whose .image matches this tile
       const entry = levelData.find(item => imgUrl.includes(item.image));
       if (!entry) return; // Skip if no match
  
       // Build the study card
       const studyItem = document.createElement('div');
       studyItem.className = 'study-item';
       studyItem.innerHTML = `
         <div class="study-image" style="background-image: url('${entry.image}')"></div>
         <h2>${entry.title}</h2>
         <p>${entry.text}</p>
       `;
       studyItems.appendChild(studyItem);
     });
  
     // Show the overlay
     studyScreen.classList.remove('hidden');
     requestAnimationFrame(() => {
       studyScreen.classList.add('show');
    });

    document.getElementById('close-study').addEventListener('click', () => {
        // Fade out the study overlay
        document.getElementById('study-screen').classList.remove('show');
      
        // Flip all tiles back
        document.querySelectorAll('.tile').forEach(tile => {
          tile.classList.remove('flip');
        });

        setNewQuestion();

      
        // Wait for the flip animation to complete before reshuffling
        setTimeout(() => {
          document.getElementById('question-overlay').classList.add('visible');
        }, 500); // match your CSS transition duration
      });

  }

  document.getElementById('open-study').addEventListener('click', () => {
    document.getElementById('open-study').classList.remove('show');
    document.getElementById('open-study').classList.add('hidden');
    document.getElementById('question-overlay').classList.remove('visible');
    const studyScreen = document.getElementById('study-screen');
    const studyItems = studyScreen.querySelector('#study-items');
    // Show the overlay
    studyScreen.classList.remove('hidden');
    requestAnimationFrame(() => {
      studyScreen.classList.add('show');
   });
  }); 

  document.getElementById('start-answer').addEventListener('click', () => {
    document.getElementById('question-overlay').classList.remove('visible');
  });
  
  function reshuffleTiles() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    tiles = [];
    flippedTiles = [];
    matchedPairs = 0;
    createTiles(); // This assumes you already have a `createTiles()` function
  }

  function setNewQuestion() {
    const unused = levelData.filter(item =>
      selectedImages.includes(item.image) && !usedQuestions.includes(item.image)
    );
  
    currentQuestionItem = unused[Math.floor(Math.random() * unused.length)];
    usedQuestions.push(currentQuestionItem.image);
  
    document.getElementById('question-text').innerHTML = currentQuestionItem.question;
    document.getElementById('question-title').innerHTML = currentQuestionItem.title;
    document.getElementById('question-overlay').classList.add('visible');
  }
  

  // Initialize
  createTiles();
