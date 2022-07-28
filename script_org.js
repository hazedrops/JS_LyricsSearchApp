const form = document.getElementById('form')
const search = document.getElementById('search')
const result = document.getElementById('result')
const more = document.getElementById('more')

const apiURL = 'https://api.lyrics.ovh'

// Search by song or artist
async function searchSongs(term) {
  const res = await fetch(`${apiURL}/suggest/${term}`); // The fetch call returns promis, so put await in front of fetch
  const data = await res.json();
  
  showData(data);
}

// Show song and artist in DOM
function showData(data) {
  // join('') will turn all the <li>s into strings
  result.innerHTML = `
    <ul class="songs">
      ${data.data
        .map(
          (song) => `
          <li>
            <span><strong>${song.artist.name}</strong> - ${song.title}</span>
            <button class="btn" data-artist="${song.artist.name}" data-songtitle="${song.title}">Get Lyrics</button>
          </li>
        `
        )
        .join('')}
    </ul>
  `;

  if(data.prev || data.next) {
    // If there's a prev/next page, then put the button into the innerHTML, or leave it blank
    // pass data.prev(url from the data > "prev" attribute) / data.next as a parameter of getMoreSongs() when buttons are clicked
    more.innerHTML = `    
      ${
        data.prev
          ? `<button class="btn newColor" onclick="getMoreSongs('${data.prev}')">Prev</button>`
          : ''
      }
      ${
        data.next
          ? `<button class="btn newColor" onclick="getMoreSongs('${data.next}')">Next</button>`
          : ''
      }
    `
  } else more.innerHTML = '';
}

// Get prev/next songs
async function getMoreSongs(url) {
  const res = await fetch(`https://cors-anywhere.herokuapp.com/${url}`); 
  const data = await res.json();
  
  showData(data);
}

// Get lyrics for song
async function getLyrics(artist, songTitle) {
  const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
  const data = await res.json();

  // Replace /r/n from the original data into the line breaks '<br>'
  const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');

  result.innerHTML = `
    <h2><strong>${artist}</strong> - ${songTitle}</h2>
    <span>${lyrics}</span>
    `;

  more.innerHTML = '';
}

// Event listeners
form.addEventListener('submit', (e) => {
  e.preventDefault()

  const searchTerm = search.value.trim()

  // Validate if search term is entered
  if (!searchTerm) {
    alert('Please type in a search term')
  } else {
    searchSongs(searchTerm)
  }
});

// Get lyrics when a button clicked
// adding event listener into the parent element('result'), since the button is dynamically generated with the script
result.addEventListener('click', e => {
  const clickedEl = e.target;

  // Execute only if 'Get Lyrics' button is clicked
  if(clickedEl.tagName === 'BUTTON') {
    // use .getAttribute() to access the 'data-xx' attribute of an element
    const artist = clickedEl.getAttribute('data-artist');
    const songTitle = clickedEl.getAttribute('data-songtitle');

    getLyrics(artist, songTitle);
  }
})
