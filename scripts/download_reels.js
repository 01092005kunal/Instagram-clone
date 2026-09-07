import fs from 'fs';
import path from 'path';
import https from 'https';

const videosDir = path.resolve('public', 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// High quality 9:16 portrait vertical video clips
const videoSources = [
  {
    name: 'reel1.mp4',
    url: 'https://res.cloudinary.com/demo/video/upload/c_fill,ar_9:16,w_540,h_960/sea_turtle.mp4'
  },
  {
    name: 'reel2.mp4',
    url: 'https://res.cloudinary.com/demo/video/upload/c_fill,ar_9:16,w_540,h_960/dog.mp4'
  },
  {
    name: 'reel3.mp4',
    url: 'https://res.cloudinary.com/demo/video/upload/c_fill,ar_9:16,w_540,h_960/elephants.mp4'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = (targetUrl) => {
      const parsedUrl = new URL(targetUrl);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      };

      https.get(options, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return request(response.headers.location);
        }
        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(new Error(`Status: ${response.statusCode}`));
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
    };
    request(url);
  });
}

async function run() {
  console.log('Downloading sample reels to public/videos/...');
  for (const item of videoSources) {
    const dest = path.join(videosDir, item.name);
    try {
      console.log(`Downloading ${item.name}...`);
      await downloadFile(item.url, dest);
      console.log(`✓ ${item.name} downloaded successfully (${(fs.statSync(dest).size / (1024 * 1024)).toFixed(2)} MB)`);
    } catch (err) {
      console.warn(`Failed primary download for ${item.name}: ${err.message}`);
    }
  }
  console.log('Done!');
}

run();
