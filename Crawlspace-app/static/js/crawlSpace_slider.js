/**
 * Initialise the slider, generating the slider's HTML content and assign their relevant content and event listeners
 */
function initSlider(){
  const track = document.querySelector('.slider__track ')
  // Get all slides that are children of the slider element
  const slides = Array.from(track.children)
  const nextButton = document.querySelector('.slider__next')
  const previousButton = document.querySelector('.slider__previous')
  const dotContainer = document.querySelector('.slider__nav')
  // Get all dot elements that are children of the dotContainer element
  const dots = Array.from(dotContainer.children)
  // Get the with of the first slide which is used to calculate how far to move each slide
  const slideWidth = slides[0].getBoundingClientRect().width

  track.style.left = '0'
  nextButton.classList.remove('hidden')
  previousButton.classList.add('hidden')
  // Move all slides to their correct position within the slider container
  slides.forEach((slide, index) => {
    slide.style.left = index * slideWidth + `px`
  })

  /**
   * Get the index of the currently selected slide based on whether the slider has the 'selected' class
   * @param {array} slides The array of slide HTML elements
   * @return {number}
   */
  function getCurrentIndex(slides) {
    let currentIndex

    // Iterate through the slides and check if they contain the 'selected' class
    for (let index = 0; index < dots.length; index++) {
      const slide = slides[index]
      if (slide.classList.contains('selected')) {
        currentIndex = index
      }
    }

    return currentIndex
  }

  /**
   * Update the slider by moving the target slide as the current slide shown by the slider
   * @param {array} slides The array of slide HTML elements
   * @param {number} currentIndex The index of the current slide element selected based on its position in the slides array
   * @param {number} targetIndex The index of the slide that will be set as the new current slide
   */
  function updateSlides(track, currentIndex, targetIndex) {
    const currentSlide = slides[currentIndex]
    const targetSlide = slides[targetIndex]
    // Move the slider track to show the new target slide within the slider
    track.style.left = '-' + targetSlide.style.left
    currentSlide.classList.remove('selected')
    targetSlide.classList.add('selected')
  }

  /**
   * Update the dot elements to highlight the slide corresponding to the current slide and removing the highlight from the previous slide
   * @param {number} currentIndex The index of the current slide element selected based on its position in the slides array
   * @param {number} targetIndex The index of the slide that will be set as the new current slide
   */
  function updateDots(currentIndex, targetIndex) {
    dots[currentIndex].classList.remove('selected')
    dots[targetIndex].classList.add('selected')
  }

  /**
   * Update the next and previous slider button elements to show or hide the buttons depending on the number of slides left
   * @param {number} targetIndex The index of the slide that will be set as the new current slide
   */
  function updateArrows(targetIndex) {
    if (targetIndex === 0) {
      previousButton.classList.add('hidden')
      nextButton.classList.remove('hidden')
    } else if (targetIndex === slides.length - 1) {
      previousButton.classList.remove('hidden')
      nextButton.classList.add('hidden')
    } else {
      previousButton.classList.remove('hidden')
      nextButton.classList.remove('hidden')
    }
  }

  /**
   * Move to the next slide and update the slide, dots, and arrow elements to display the next slide
   */
  function nextSlide() {
    const currentIndex = getCurrentIndex(slides)
    const nextIndex = currentIndex + 1

    updateSlides(track, currentIndex, nextIndex)
    updateDots(currentIndex, nextIndex)
    updateArrows(nextIndex)
  }

  /**
   * Move to the previous slide and update the slide, dots, and arrow elements to display the previous slide
   */
  function previousSlide() {
    const currentIndex = getCurrentIndex(slides)
    const previousIndex = currentIndex - 1

    updateSlides(track, currentIndex, previousIndex)
    updateDots(currentIndex, previousIndex)
    updateArrows(previousIndex)
  }

  /**
   * Set the current slide based on the dot button that was clicked
   * @param {Event} e The event that triggered open edit crawl menu
   */
  function setSlide(e) {
    // If the target is not the dot button stop function
    if (!e.target.matches('button')) return

    const currentIndex = getCurrentIndex(slides)
    const clickedDot = e.target
    let targetIndex

    // Iterate through the dots until the correct index for the dots array is found based on the clicked dot element
    for (let index = 0; index < dots.length; index++) {
      if (dots[index] === clickedDot) {
        targetIndex = index
      }
    }

    updateSlides(track, currentIndex, targetIndex)
    updateDots(currentIndex, targetIndex)
    updateArrows(targetIndex)
  }

  // Assign the event listene to the slider's button elements
  nextButton.addEventListener('click', nextSlide)
  previousButton.addEventListener('click', previousSlide)
  dotContainer.addEventListener('click', setSlide)
}
