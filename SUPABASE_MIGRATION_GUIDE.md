# Complete Firebase → Supabase Migration Guide
## For Your Instagram Clone (React + Chakra UI)

---

## 📋 Table of Contents
1. Supabase Setup
2. Database Schema
3. Code Migration (Authentication)
4. Code Migration (Database/Firestore)
5. Code Migration (Storage)
6. Environment Setup
7. Testing

---

## ✅ STEP 1: SUPABASE SETUP (10 minutes)

### 1.1 Create Supabase Project
1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with email or GitHub
4. Click **"New Project"**
5. Fill in:
   - **Name:** `instagram-clone`
   - **Database Password:** Create strong password (save it!)
   - **Region:** Choose closest to you (e.g., Singapore for India)
6. Wait 2-3 minutes for project creation
7. Copy your **Project URL** and **Anon Key** (you'll need these)

### 1.2 Get Your Credentials
Once project is created:
1. Go to **Settings** (bottom left) → **API**
2. Copy:
   - `Project URL` (looks like: `https://xxxxx.supabase.co`)
   - `anon public` key
3. Save these in your `.env.local` file

---

## 📦 STEP 2: INSTALL DEPENDENCIES

### Replace Firebase packages with Supabase:

```bash
# Remove Firebase packages
npm uninstall firebase

# Install Supabase package
npm install @supabase/supabase-js

# Keep other packages
npm install react chakra-ui @emotion/react @emotion/styled framer-motion
```

---

## 🗄️ STEP 3: DATABASE SCHEMA

Go to Supabase → **SQL Editor** → Create new query and paste this:

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  profile_pic_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts Table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caption TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comments Table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Likes Table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Followers Table (for follow/unfollow)
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now - add restrictions later)
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Followers data is viewable by everyone" ON followers FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON followers FOR DELETE USING (auth.uid() = follower_id);
```

---

## 🔐 STEP 4: AUTHENTICATION MIGRATION

### OLD CODE (Firebase):
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, signUp, signIn } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### NEW CODE (Supabase) - Create `src/supabase/client.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

### Update `.env.local`:
```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🔑 STEP 5: AUTHENTICATION FUNCTIONS

### Sign Up - OLD vs NEW

**OLD (Firebase):**
```javascript
import { createUserWithEmailAndPassword } from 'firebase/auth';

const handleSignUp = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Save username to Firestore
    return user;
  } catch (error) {
    console.error(error.message);
  }
};
```

**NEW (Supabase):**
```javascript
import { supabase } from './supabase/client';

const handleSignUp = async (email, password, username) => {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          username,
        },
      ]);

    if (profileError) throw profileError;
    return authData.user;
  } catch (error) {
    console.error('Sign up error:', error.message);
  }
};
```

### Sign In - OLD vs NEW

**OLD (Firebase):**
```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';

const handleSignIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error(error.message);
  }
};
```

**NEW (Supabase):**
```javascript
const handleSignIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Sign in error:', error.message);
  }
};
```

### Sign Out - OLD vs NEW

**OLD (Firebase):**
```javascript
import { signOut } from 'firebase/auth';

const handleSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error.message);
  }
};
```

**NEW (Supabase):**
```javascript
const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error.message);
  }
};
```

### Get Current User

**OLD (Firebase):**
```javascript
import { onAuthStateChanged } from 'firebase/auth';

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setCurrentUser(user);
    }
  });
  return unsubscribe;
}, []);
```

**NEW (Supabase):**
```javascript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      setCurrentUser(session.user);
    }
  });

  return () => subscription?.unsubscribe();
}, []);
```

---

## 💾 STEP 6: DATABASE OPERATIONS (Firestore → Supabase)

### Create a Post - OLD vs NEW

**OLD (Firebase):**
```javascript
import { collection, addDoc } from 'firebase/firestore';

const createPost = async (caption, imageUrl) => {
  try {
    const postRef = collection(db, 'posts');
    await addDoc(postRef, {
      userId: currentUser.uid,
      caption,
      imageUrl,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error(error);
  }
};
```

**NEW (Supabase):**
```javascript
const createPost = async (caption, imageUrl) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: currentUser.id,
          caption,
          image_url: imageUrl,
        },
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Create post error:', error.message);
  }
};
```

### Get All Posts - OLD vs NEW

**OLD (Firebase):**
```javascript
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const getPosts = () => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    setPosts(posts);
  });

  return unsubscribe;
};
```

**NEW (Supabase):**
```javascript
// One-time fetch
const getPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*, users(*), likes(*), comments(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPosts(data);
  } catch (error) {
    console.error('Get posts error:', error.message);
  }
};

// Real-time updates (better than Firebase)
const listenToPosts = () => {
  const subscription = supabase
    .from('posts')
    .on('*', (payload) => {
      console.log('New update:', payload);
      getPosts(); // Refresh posts
    })
    .subscribe();

  return subscription;
};
```

### Like a Post - OLD vs NEW

**OLD (Firebase):**
```javascript
import { collection, addDoc, query, where, deleteDoc } from 'firebase/firestore';

const toggleLike = async (postId) => {
  try {
    const likeRef = collection(db, 'likes');
    const q = query(
      likeRef,
      where('postId', '==', postId),
      where('userId', '==', currentUser.uid)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Add like
      await addDoc(likeRef, {
        postId,
        userId: currentUser.uid,
        createdAt: new Date(),
      });
    } else {
      // Remove like
      await deleteDoc(snapshot.docs[0].ref);
    }
  } catch (error) {
    console.error(error);
  }
};
```

**NEW (Supabase):**
```javascript
const toggleLike = async (postId) => {
  try {
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', currentUser.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      if (error) throw error;
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: currentUser.id }]);
      if (error) throw error;
    }
  } catch (error) {
    console.error('Like toggle error:', error.message);
  }
};
```

### Add Comment - OLD vs NEW

**OLD (Firebase):**
```javascript
const addComment = async (postId, text) => {
  try {
    await addDoc(collection(db, 'comments'), {
      postId,
      userId: currentUser.uid,
      text,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error(error);
  }
};
```

**NEW (Supabase):**
```javascript
const addComment = async (postId, text) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          user_id: currentUser.id,
          text,
        },
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Add comment error:', error.message);
  }
};
```

### Get User Profile - OLD vs NEW

**OLD (Firebase):**
```javascript
const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.data();
  } catch (error) {
    console.error(error);
  }
};
```

**NEW (Supabase):**
```javascript
const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get profile error:', error.message);
  }
};
```

### Update User Profile - OLD vs NEW

**OLD (Firebase):**
```javascript
const updateUserProfile = async (userId, updates) => {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
  } catch (error) {
    console.error(error);
  }
};
```

**NEW (Supabase):**
```javascript
const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update profile error:', error.message);
  }
};
```

---

## 📸 STEP 7: FILE STORAGE MIGRATION

### Upload Image - OLD vs NEW

**OLD (Firebase):**
```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadImage = async (file) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `posts/${currentUser.uid}/${file.name}`);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error(error);
  }
};
```

**NEW (Supabase):**
```javascript
const uploadImage = async (file) => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `posts/${currentUser.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('instagram-bucket')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('instagram-bucket')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Upload error:', error.message);
  }
};
```

### Setup Storage Bucket in Supabase

1. Go to Supabase Dashboard → **Storage**
2. Click **"Create a new bucket"**
3. Name: `instagram-bucket`
4. Make it **Public** (toggle on)
5. Click **"Create bucket"**
6. Set public access policy by going to **Policies** → **Add Policy** → Allow public read access

---

## 🚀 STEP 8: COMPLETE AUTH CONTEXT (Recommended)

Create `src/context/AuthContext.jsx`:

```javascript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email, password, username) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from('users')
      .insert([{ id: authData.user.id, email, username }]);

    if (profileError) throw profileError;
    return authData.user;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

Wrap your app with it in `src/main.jsx`:

```javascript
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

---

## 🎯 STEP 9: TESTING CHECKLIST

- [ ] Supabase project created ✓
- [ ] Credentials in `.env.local` ✓
- [ ] Database schema created ✓
- [ ] Sign up works ✓
- [ ] Sign in works ✓
- [ ] Create post works ✓
- [ ] Like/unlike post works ✓
- [ ] Comment on post works ✓
- [ ] Image upload works ✓
- [ ] View profile works ✓

---

## 📱 FULL EXAMPLE: CREATE POST WITH IMAGE

```javascript
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';

const CreatePost = () => {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!image) {
      alert('Please select an image');
      return;
    }

    setLoading(true);

    try {
      // Upload image
      const fileName = `${Date.now()}-${image.name}`;
      const filePath = `posts/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('instagram-bucket')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('instagram-bucket')
        .getPublicUrl(filePath);

      // Create post in database
      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            caption,
            image_url: data.publicUrl,
          },
        ]);

      if (postError) throw postError;

      // Clear form
      setCaption('');
      setImage(null);
      alert('Post created successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreatePost}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0])}
      />
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption..."
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Post'}
      </button>
    </form>
  );
};

export default CreatePost;
```

---

## 💡 QUICK REFERENCE

| Operation | Firebase | Supabase |
|-----------|----------|----------|
| Signup | `createUserWithEmailAndPassword` | `auth.signUp()` |
| Login | `signInWithEmailAndPassword` | `auth.signInWithPassword()` |
| Logout | `signOut()` | `auth.signOut()` |
| Get User | `onAuthStateChanged` | `onAuthStateChange` |
| Create Doc | `addDoc()` | `.insert()` |
| Get Docs | `getDocs()` | `.select()` |
| Update | `updateDoc()` | `.update()` |
| Delete | `deleteDoc()` | `.delete()` |
| Upload File | `uploadBytes()` | `.upload()` |
| Get URL | `getDownloadURL()` | `.getPublicUrl()` |

---

## 🆘 TROUBLESHOOTING

**Q: Getting CORS error?**
A: Check Storage bucket policies. Go to Supabase → Storage → Policies → Add "allow public read"

**Q: Data not updating in real-time?**
A: Supabase uses different real-time syntax. See Step 6 `listenToPosts()` example

**Q: Can't upload images?**
A: Ensure storage bucket is PUBLIC and file path is correct

**Q: Auth not persisting?**
A: Add `onAuthStateChange` listener as shown in AuthContext

---

## ✅ You're Done!

Your Instagram clone now runs on Supabase instead of Firebase!

**Benefits:**
- ✅ No more surprise bills
- ✅ SQL database (better for relational data)
- ✅ Better real-time capabilities
- ✅ Generous free tier

**Next Steps:**
1. Test everything thoroughly
2. Deploy to Vercel/Netlify
3. Monitor costs (should be nearly free!)

Happy coding! 🚀
