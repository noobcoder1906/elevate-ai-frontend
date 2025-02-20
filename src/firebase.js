// Import Firebase SDK modules
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

// 🔹 Firebase configuration (Replace with your credentials)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 🔹 Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/**  
 * 🔹 AuthState Listener - Checks user authentication status  
 */
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ User Logged In:", user.email);
  } else {
    console.log("❌ User Logged Out");
  }
});

/**  
 * 🔹 Function to Upload User Avatar to Firebase Storage  
 */
const uploadAvatar = async (file, userId) => {
  if (!file) {
    console.error("❌ No file selected");
    return;
  }

  try {
    const storageRef = ref(storage, `avatars/${userId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Upload progress tracking
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Uploading: ${progress.toFixed(2)}%`);
        },
        (error) => {
          console.error("❌ Upload failed:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("✅ Avatar uploaded. URL:", downloadURL);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error("❌ Error uploading avatar:", error);
    throw error;
  }
};

/**  
 * 🔹 Function to Save Avatar URL to Firestore  
 */
const saveAvatarToFirestore = async (userId, avatarURL) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { avatar: avatarURL });
    console.log("✅ Avatar URL saved to Firestore!");
  } catch (error) {
    console.error("❌ Error saving avatar URL:", error);
    throw error;
  }
};

/**  
 * 🔹 Function to Handle File Upload (For React Input)  
 */
const handleFileUpload = async (event, userId) => {
  const file = event.target.files[0];
  if (!file || !userId) {
    console.error("❌ Invalid file or user ID");
    return;
  }

  try {
    const avatarURL = await uploadAvatar(file, userId);
    await saveAvatarToFirestore(userId, avatarURL);
    console.log("🎉 Avatar uploaded and saved successfully!");
  } catch (error) {
    console.error("❌ Upload failed:", error);
  }
};

/**  
 * 🔹 Function to Sign Up Users  
 */
const signUpUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName,
      avatar: "",
      createdAt: new Date(),
    });

    console.log("✅ User signed up & profile created:", user.uid);
  } catch (error) {
    console.error("❌ Sign-up Error:", error.message);
    throw error;
  }
};

/**  
 * 🔹 Function to Log In Users  
 */
const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Logged in as:", userCredential.user.email);
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    throw error;
  }
};

/**  
 * 🔹 Function to Log Out Users  
 */
const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("✅ User Logged Out");
  } catch (error) {
    console.error("❌ Logout Error:", error.message);
  }
};

/**  
 * 🔹 Function to Get User Profile Data from Firestore  
 */
const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log("✅ User Data:", userSnap.data());
      return userSnap.data();
    } else {
      console.log("❌ No such user!");
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    throw error;
  }
};

// ✅ Export Firebase services and helper functions
export {
  app,
  auth,
  db,
  storage,
  onAuthStateChanged,
  uploadAvatar,
  saveAvatarToFirestore,
  handleFileUpload,
  signUpUser,
  loginUser,
  logoutUser,
  getUserProfile,
};
