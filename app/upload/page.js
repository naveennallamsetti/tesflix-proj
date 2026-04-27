'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './upload.module.css';

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Upload Video</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Title</label>
            <input type="text" name="title" required className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <label>Category</label>
            <select name="type" className={styles.input} style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
              <option value="movie" style={{ color: 'black' }}>Movie</option>
              <option value="series" style={{ color: 'black' }}>Series</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Description</label>
            <textarea name="description" rows="4" required className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <label>Video File</label>
            <input type="file" name="videoFile" accept="video/*" required className={styles.fileInput} />
          </div>
          <div className={styles.inputGroup}>
            <label>Thumbnail Image</label>
            <input type="file" name="thumbnailFile" accept="image/*" required className={styles.fileInput} />
          </div>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
}
