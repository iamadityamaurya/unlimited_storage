# NexGenStorage 🚀

**NexGenStorage** is a sleek, client-side web application that transforms your Telegram account into an organized, unlimited personal cloud storage system. 

By leveraging Telegram's official API (MTProto), NexGenStorage connects directly to your chats, channels, or groups and overlays a virtual filesystem with directories, search, sorting, and storage analytics.

---

## 📖 Backstory & The Problem

Saving files in Telegram group chats or "Saved Messages" has been a popular, free alternative to costly cloud storage services. However, as your history grows, finding a specific file becomes a nightmare. If you don't remember the exact name, it's buried forever under a mountain of messages.

**NexGenStorage solves this** by introducing a structured, virtual folder manager. Now, you can upload, organize, search, and download your files in a nested folder layout, all stored securely inside your own Telegram chat.

---

## ✨ Features

- 📂 **Virtual Folder Architecture**: Organize files into virtual folders. Instantly rename folders ($O(1)$ renaming) and perform clean recursive folder deletions.
- 🗂️ **Uncategorised Catch-all**: Automatically groups legacy uploads, files without folder indicators, or files from deleted folders into a system-wide `"Uncategorised"` folder.
- 📤 **Seamless Uploads & Downloads**: Upload files directly into folders from your browser, and download them with original filenames and MIME types.
- 🔍 **Instant Search & Filter**: Find files inside any folder instantly.
- ⚡ **Smart Sorting**: Sort files by **Name (A-Z)**, **Date**, or **Size** (ascending and descending).
- 📊 **Storage Analytics**: View a dashboard detailing your file count, total drive size, and file type distributions.
- 🔒 **100% Secure & Private**: No middleman databases or backend servers. Your Telegram API credentials and MTProto session tokens are stored locally in your browser cookies only.
- 🎨 **Premium UI/UX**: Responsive glassmorphism interface styled with smooth micro-animations and custom scrollbars.

---

## 🔑 How to Get Your Telegram API Key & Hash

To connect NexGenStorage to your Telegram account, you will need an **API ID** and **API Hash**. Follow these steps to obtain them in under 2 minutes:

1. **Log in to Telegram**:
   - Go to [my.telegram.org](https://my.telegram.org) in your web browser.
   - Enter your phone number (including country code, e.g., `+1 234 567 8900`) and click **Next**.
   - Copy the login confirmation code sent to you via the official Telegram app, paste it on the website, and click **Sign In**.

2. **Access API Development Tools**:
   - Click on the **API development tools** link.

3. **Create a New Application**:
   - Fill out the short form:
     - **App title**: Choose a name (e.g., `NexGenStorage`).
     - **Short name**: Choose a short identifier (e.g., `nexgenstorage`).
     - **Platform**: Select **Web** (or any other option).
     - **Description**: Add a brief description (optional).
   - Click the **Create application** button.

4. **Copy Your Credentials**:
   - Once created, you will see a page containing:
     - `App api_id` (e.g., `1234567`)
     - `App api_hash` (e.g., `32-character alphanumeric hex string`)
   - Copy both credentials. You will paste them into the NexGenStorage login page along with your phone number to authenticate.

---

## 🛠️ Installation & Local Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Steps
1. Navigate to the web folder:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the local development server:
   ```bash
   npm run dev
   ```
   - Open your browser to the URL displayed in the terminal (usually `http://localhost:5173`).

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🔒 Privacy & Security Disclaimer

NexGenStorage is fully client-side. The app establishes a direct connection between your browser and Telegram's servers using the official Telegram MTProto library (via [GramJS](https://github.com/gram-js/gramjs)). 

Your API keys, phone number, and access tokens are never transmitted to any third-party server. They remain securely in your local browser storage.
