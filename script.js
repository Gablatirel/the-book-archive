// 🔥 YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyD-2vP9tlRY8t5-PbX8BP38Et_fwOflQOY",
  authDomain: "thebookarchive-25563.firebaseapp.com",
  projectId: "thebookarchive-25563",
  storageBucket: "thebookarchive-25563.firebasestorage.app",
  messagingSenderId: "361604208847",
  appId: "1:361604208847:web:e75c5da8e832003acdbfba"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// 👤 AUTH
function signup() {
  auth.createUserWithEmailAndPassword(
    email.value,
    password.value
  );
}

function login() {
  auth.signInWithEmailAndPassword(
    email.value,
    password.value
  );
}

function logout() {
  auth.signOut();
}

// 📤 UPLOAD
async function uploadBook() {
  const file = fileInput.files[0];
  if (!file) return alert("Pick a file");

  const ref = storage.ref("books/" + file.name);
  await ref.put(file);

  const url = await ref.getDownloadURL();

  await db.collection("books").add({
    name: file.name,
    url: url,
    type: file.name.endsWith(".epub") ? "epub" : "mobi",
    rating: 0,
    ratings: 0
  });

  loadBooks();
}

// 📚 LOAD + SEARCH
async function loadBooks() {
  const search = document.getElementById("search").value.toLowerCase();
  const container = document.getElementById("books");
  container.innerHTML = "";

  const snapshot = await db.collection("books").get();

  snapshot.forEach(doc => {
    const book = doc.data();

    if (!book.name.toLowerCase().includes(search)) return;

    const div = document.createElement("div");
    div.className = "book";

    div.innerHTML = `
      <h3>${book.name}</h3>
      <p>⭐ ${book.rating.toFixed(1)}</p>

      ${book.type === "epub"
        ? `<button onclick="readBook('${book.url}')">Read</button>`
        : `<a href="${book.url}" target="_blank">Download</a>`
      }

      <br><br>
      <button onclick="rateBook('${doc.id}', 5)">⭐ 5</button>
      <button onclick="rateBook('${doc.id}', 3)">⭐ 3</button>

      <div>
        <input placeholder="Comment..." id="c-${doc.id}">
        <button onclick="comment('${doc.id}')">Send</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// ⭐ RATING
async function rateBook(id, value) {
  const ref = db.collection("books").doc(id);
  const doc = await ref.get();

  const data = doc.data();

  const newRatings = data.ratings + 1;
  const newRating =
    (data.rating * data.ratings + value) / newRatings;

  await ref.update({
    rating: newRating,
    ratings: newRatings
  });

  loadBooks();
}

// 💬 COMMENTS
async function comment(id) {
  const text = document.getElementById("c-" + id).value;

  await db.collection("books")
    .doc(id)
    .collection("comments")
    .add({
      text: text,
      time: Date.now()
    });

  alert("Comment added!");
}

// 📖 EPUB READER
let book, rendition;

function readBook(url) {
  document.getElementById("reader").classList.remove("hidden");

  book = ePub(url);
  rendition = book.renderTo("viewer", {
    width: "100%",
    height: "100%"
  });

  rendition.display();
}

function closeReader() {
  document.getElementById("reader").classList.add("hidden");
}
