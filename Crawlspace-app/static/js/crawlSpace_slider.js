/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */
function initSlider(){
  const track = document.querySelector('.slider__track ')
  const slides = Array.from(track.children)
  const nextButton = document.querySelector('.slider__next')
  const previousButton = document.querySelector('.slider__previous')
  const dotContainer = document.querySelector('.slider__nav')
  const dots = Array.from(dotContainer.children)
  const slideWidth = slides[0].getBoundingClientRect().width

  track.style.left = '0'
  nextButton.classList.remove('hidden')
  previousButton.classList.add('hidden')
  slides.forEach((slide, index) => {
    slide.style.left = index * slideWidth + `px`
  })

  function getCurrentIndex(slides) {
    let currentIndex

    for (let index = 0; index < dots.length; index++) {
      const slide = slides[index]
      if (slide.classList.contains('selected')) {
        currentIndex = index
      }
    }

    return currentIndex
  }

  function updateSlides(track, currentIndex, targetIndex) {
    const currentSlide = slides[currentIndex]
    const targetSlide = slides[targetIndex]
    track.style.left = '-' + targetSlide.style.left
    currentSlide.classList.remove('selected')
    targetSlide.classList.add('selected')
  }

  function updateDots(currentIndex, targetIndex) {
    dots[currentIndex].classList.remove('selected')
    dots[targetIndex].classList.add('selected')
  }

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

  function nextSlide() {
    const currentIndex = getCurrentIndex(slides)
    const nextIndex = currentIndex + 1

    updateSlides(track, currentIndex, nextIndex)
    updateDots(currentIndex, nextIndex)
    updateArrows(nextIndex)
  }

  function previousSlide() {
    const currentIndex = getCurrentIndex(slides)
    const previousIndex = currentIndex - 1

    updateSlides(track, currentIndex, previousIndex)
    updateDots(currentIndex, previousIndex)
    updateArrows(previousIndex)
  }

  function setSlide(e) {
    if (!e.target.matches('button')) return

    const currentIndex = getCurrentIndex(slides)
    const clickedDot = e.target
    let targetIndex

    for (let index = 0; index < dots.length; index++) {
      if (dots[index] === clickedDot) {
        targetIndex = index
      }
    }

    updateSlides(track, currentIndex, targetIndex)
    updateDots(currentIndex, targetIndex)
    updateArrows(targetIndex)
  }

  nextButton.addEventListener('click', nextSlide)
  previousButton.addEventListener('click', previousSlide)
  dotContainer.addEventListener('click', setSlide)
}
