const images = [
    'image1.jpg', 'image2.jpg', 'image3.jpg', 
    'image4.jpg', 'image5.jpg', 'image6.jpg',
    'image7.jpg', 'image8.jpg', 'image9.jpg', 
    'image10.jpg', 'image11.jpg', 'image12.jpg'
  ]; 

  //brought in from intro page work - may be redundent with above
  const introImages = Array.from({ length: 12 }, (_, i) => `image${i + 1}.jpg`);

  let tiles = [];
  let flippedTiles = [];
  let matchedPairs = 0;
  
  let levelData = [];
  let usedQuestions = [];
  let currentQuestionItem = null;
  let firstTimeClosing = true;
  
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
  
    // Step 1: Pick 6 unique images
    selectedImages = shuffle([...images]).slice(0, 6); // [imgA, imgB, imgC]
  
    // Step 2: Create image pairs
    const imagePairs = shuffle([...selectedImages, ...selectedImages]); // [imgA, imgB, imgC, imgA, imgB, imgC] shuffled
  
    for (let i = 0; i < 12; i++) {
      allTiles.push({
        image: imagePairs[i]
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
          showConfetti();
        }, 200);

        setTimeout(() => {
          setNewQuestion();
        }, 2000);
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
    //Remove start screen
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'grid';
    document.body.style.backgroundColor = 'white';
    // Flip all tiles at the start
    setTimeout(() => {
        const tileElements = document.querySelectorAll('.tile');
        tileElements.forEach((tile, index) => {
          setTimeout(() => {
            tile.classList.add('flip');
          }, index * 50); // 50ms delay between each tile flip
        });
      }, 900); // delay the intital flip

      setTimeout(() => {
        // Flip all tiles back
          document.querySelectorAll('.tile').forEach(tile => {
            tile.classList.remove('flip');
          });
      }, 3500);

      setTimeout(() => {
        showStudyScreenWithImages(selectedImages);
      }, 4500); // delay the flip back
  });

  // Disable the study button initially
  const openStudyBtn = document.getElementById('open-study-button');
  openStudyBtn.disabled = true;
  openStudyBtn.style.opacity = '0';
  const openQuestionBtn = document.getElementById('open-question-button');
  openQuestionBtn.disabled = true;
  openQuestionBtn.style.display = 'none';
  // Enable after first close of study screen
  const originalCloseStudy = document.getElementById('close-study').onclick;
  document.getElementById('close-study').addEventListener('click', () => {
    openStudyBtn.disabled = false;
    openStudyBtn.style.opacity = '1';
    openQuestionBtn.disabled = false;
    openQuestionBtn.style.display = 'block';
  }, { once: true });

  // Trigger overlay when Study button is clicked
  openStudyBtn.addEventListener('click', () => {
    document.getElementById('question-overlay').classList.remove('visible');
    const studyScreen = document.getElementById('study-screen');
    openStudyBtn.style.opacity = '0';
    openQuestionBtn.style.display = 'none';
    studyScreen.classList.remove('hidden');
    requestAnimationFrame(() => {
      studyScreen.classList.add('show');
    });
  });

  // Trigger overlay when question button is clicked
  openQuestionBtn.addEventListener('click', () => {
    document.getElementById('question-overlay').classList.add('visible');
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
         <p class="researcher-name"> ${entry.name}</p>
         <h3> ${entry.role} </h3>
         <p class="research-text">${entry.text}</p>
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
        openStudyBtn.style.opacity = '1';
        openQuestionBtn.style.display = 'block';
        if(firstTimeClosing){

          setNewQuestion();
 
          // Wait for the flip animation to complete before reshuffling
          setTimeout(() => {
            document.getElementById('question-overlay').classList.add('visible');
          }, 500); // match your CSS transition duration
          firstTimeClosing = false;
       }
      });

  } 

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

  //all the JS functions from intro image thing
  function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    function fillScreenWithTiles() {
      const mosaic = document.getElementById('intro-mosaic');
      const title = document.getElementById('title-overlay');
      const titleText = document.getElementById('title-text');
      const buttons = document.getElementById('button-container');

      const baseSize = 100;
      const minCols = 4;

      const cols = Math.max(minCols, Math.floor(window.innerWidth / baseSize));
      const tileSize = window.innerWidth / cols;
      const rows = Math.ceil(window.innerHeight / tileSize);

      mosaic.style.gridTemplateColumns = `repeat(${cols}, ${tileSize}px)`;
      mosaic.style.gridTemplateRows = `repeat(${rows}, ${tileSize}px)`;

      const totalTiles = rows * cols;
      mosaic.innerHTML = '';

      const repeatedImages = [];
      while (repeatedImages.length < totalTiles) {
        repeatedImages.push(...introImages);
      }
      repeatedImages.length = totalTiles;

      shuffleArray(repeatedImages);

      for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.classList.add('intro-tile');
        tile.style.backgroundImage = `url(${repeatedImages[i]})`;
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.style.transitionDelay = `${Math.floor(i / cols + i % cols) * 50}ms`;
        mosaic.appendChild(tile);
      }

      setTimeout(() => {
      
      

      requestAnimationFrame(() => {
        document.querySelectorAll('.intro-tile').forEach(tile => {
          tile.style.opacity = '1';
        });
      });

      // Flip forward, then back, then show title
      setTimeout(() => {
        const tiles = document.querySelectorAll('.intro-tile');
        tiles.forEach(tile => tile.classList.add('flipped'));
        //if there is a way to set something do it here for title-overlay
        //in CSS
        title.classList.add('visible');

        setTimeout(() => {
          tiles.forEach(tile => tile.classList.remove('flipped'));

          // Fade out just the text
          titleText.style.opacity = '0';
          buttons.classList.remove('visible');

          setTimeout(() => {
            titleText.innerHTML = `Memory<br>Quiz`;
            titleText.style.opacity = '1';
            buttons.classList.add('visible');
          }, 400);
        }, 1800);
      }, 1100);
    //this is a delay at the start to allow the images to load
    //if anything within this timeout is the issue then this won't fix  
    }, 500);
    }


    function showConfetti(){
      const confettiWrapper = document.querySelector('.confetti-wrapper');
      // Generate confetti
      for (let i = 0; i < 300; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti-piece');
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.setProperty('--fall-duration', `${Math.random() *1 + 1.5}s`);
        confetti.style.setProperty('--confetti-color', getRandomColor());
        const startY = -20 - Math.random() * 180; // 150vh to 330vh
        confetti.style.setProperty('--start-y', `${startY}vh`);
        confettiWrapper.appendChild(confetti);
        // Remove when animation ends
        confetti.addEventListener('animationend', () => {
          confetti.remove();
        });
      }
      function getRandomColor() {
        const colors = ['#ff00cc', '#ffd700', '#ff6600', '#00ff66', '#00ccff'];
        return colors[Math.floor(Math.random() * colors.length)];
      }
    }



    window.addEventListener('load', () => {
      fillScreenWithTiles(); // already there
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);
    });

    window.addEventListener('resize', () => {
      // clearTimeout(window._resizeTimeout);
      // window._resizeTimeout = setTimeout(fillScreenWithTiles, 200);
    });
