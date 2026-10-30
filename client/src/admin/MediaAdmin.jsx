import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Dropzone, Thumb, useToast } from './ui';

export default function MediaAdmin() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const load = () => api.get('/api/admin/media').then(setFiles);
  useEffect(() => {
    load();
  }, []);
  const upload = async (list) => {
    if (!list?.length) return;
    setBusy(true);
    try {
      const r = await api.upload(list);
      toast(`${r.files.length} fichier(s) importé(s)`);
      load();
    } catch (e) {
      toast(e.message, 'err');
    }
    setBusy(false);
  };
  const del = async (f) => {
    if (!confirm(`Supprimer ${f.name} ? Vérifiez qu’elle n’est plus utilisée.`)) return;
    await api.del(`/api/admin/media/${encodeURIComponent(f.name)}`);
    load();
  };
  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Médiathèque</h1>
          <p>Images converties en WebP haute qualité (max 2800 px) · vidéos MP4 / WebM / MOV conservées telles quelles (max 200 Mo).</p>
        </div>
        <label className="adm-btn">
          {busy ? 'Import…' : 'Importer images / vidéos'}
          <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple hidden onChange={(e) => upload(e.target.files)} />
        </label>
      </header>
      <Dropzone onFiles={upload}>
        <div className="adm-media-grid adm-media-grid--lg">
          {files.map((f) => (
            <div key={f.url} className="adm-media adm-media--static">
              <Thumb src={f.url} />
              <div className="adm-media__bar">
                <button onClick={() => navigator.clipboard?.writeText(f.url).then(() => toast('Lien copié'))}>Copier le lien</button>
                <button className="danger" onClick={() => del(f)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </Dropzone>
    </div>
  );
}
