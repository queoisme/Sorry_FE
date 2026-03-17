import { useState, useEffect, useRef } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import {
  Image, Music, Upload, Trash2, Plus, X, Youtube,
  Play, Pause, FileAudio, Film, ChevronRight,
  LayoutGrid, List, Search, RefreshCw, ExternalLink,
  Smile, FileText, Clock, HardDrive
} from 'lucide-react'
import { mediaApi, musicApi } from './api/index.js'

const getYoutubeId = (url) => {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ---- MEDIA UPLOAD MODAL ----
function MediaUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [emojis, setEmojis] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  const handleFile = (f) => {
    setFile(f)
    if (f && f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a file')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('File', file)
      if (caption) fd.append('Caption', caption)
      if (emojis) fd.append('Emojis', emojis)
      await mediaApi.upload(fd)
      toast.success('Image uploaded successfully!')
      onSuccess()
      onClose()
    } catch {
      toast.error('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Upload size={20} className="text-sky-400" /> Upload Image</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
            className="border-2 border-dashed border-gray-600 hover:border-sky-500 rounded-xl p-6 text-center cursor-pointer transition-colors group"
          >
            {preview ? (
              <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain" />
            ) : (
              <div className="space-y-2">
                <Image size={40} className="mx-auto text-gray-500 group-hover:text-sky-400 transition-colors" />
                <p className="text-gray-400 text-sm">{file ? file.name : 'Click or drag & drop image'}</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Caption</label>
            <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption..." className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1"><Smile size={14} /> Emojis</label>
            <input value={emojis} onChange={e => setEmojis(e.target.value)} placeholder="😊 🎉 ✨" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors" />
          </div>
          <button disabled={loading} className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload Image</>}
          </button>
        </form>
      </div>
    </div>
  )
}

// ---- MUSIC UPLOAD MODAL ----
function MusicUploadModal({ onClose, onSuccess }) {
  const [tab, setTab] = useState('file')
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'file') {
        if (!file) return toast.error('Please select a file')
        const fd = new FormData()
        fd.append('File', file)
        if (title) fd.append('Title', title)
        await musicApi.uploadAudio(fd)
        toast.success('Audio uploaded successfully!')
      } else {
        if (!youtubeUrl) return toast.error('Please enter YouTube URL')
        await musicApi.addYoutube(youtubeUrl)
        toast.success('YouTube music added!')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Music size={20} className="text-purple-400" /> Add Music</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="flex border-b border-gray-700">
          <button onClick={() => setTab('file')} className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'file' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300'}`}>
            <FileAudio size={14} className="inline mr-1.5" />Upload File
          </button>
          <button onClick={() => setTab('youtube')} className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === 'youtube' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-500 hover:text-gray-300'}`}>
            <Youtube size={14} className="inline mr-1.5" />YouTube
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {tab === 'file' ? (
            <>
              <div onClick={() => fileRef.current.click()} className="border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-xl p-6 text-center cursor-pointer transition-colors group">
                <FileAudio size={40} className="mx-auto text-gray-500 group-hover:text-purple-400 transition-colors mb-2" />
                <p className="text-gray-400 text-sm">{file ? file.name : 'Click or drag & drop audio file'}</p>
                <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Track title..." className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors" />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">YouTube URL</label>
              <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
          )}
          <button disabled={loading} className={`w-full ${tab === 'file' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-red-600 hover:bg-red-500'} disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2`}>
            {loading ? <><RefreshCw size={16} className="animate-spin" /> Processing...</> : tab === 'file' ? <><Upload size={16} /> Upload Audio</> : <><Youtube size={16} /> Add from YouTube</>}
          </button>
        </form>
      </div>
    </div>
  )
}

// ---- MEDIA SECTION ----
function MediaSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await mediaApi.getAll()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media item?')) return
    setDeleting(id)
    try {
      await mediaApi.delete(id)
      toast.success('Deleted successfully')
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = items.filter(i =>
    (i.fileName || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.caption || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Media Library</h1>
          <p className="text-gray-400 text-sm mt-0.5">{items.length} items</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"><RefreshCw size={16} /></button>
          <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors">{viewMode === 'grid' ? <List size={16} /> : <LayoutGrid size={16} />}</button>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"><Plus size={16} /> Upload</button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search media..." className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors" />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={32} className="animate-spin text-sky-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Image size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No media items found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-sky-500 transition-all hover:shadow-lg hover:shadow-sky-500/10">
              <div className="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden relative">
                {item.fileUrl ? (
                  <img
                    src={item.fileUrl}
                    alt={item.caption || item.fileName}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.target.style.display = 'none'
                      e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className="fallback-icon w-full h-full items-center justify-center absolute inset-0" style={{ display: item.fileUrl ? 'none' : 'flex' }}>
                  <Film size={32} className="text-gray-600" />
                </div>
              </div>
              <div className="p-3">
                <p className="text-white text-xs font-medium truncate">{item.caption || item.fileName || 'Untitled'}</p>
                {item.emojis && <p className="text-sm mt-0.5">{item.emojis}</p>}
                <p className="text-gray-500 text-xs mt-1">{formatFileSize(item.fileSize)}</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-gray-900/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"><ExternalLink size={12} /></a>}
                <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="p-1.5 bg-gray-900/80 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-colors">
                  {deleting === item.id ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="flex items-center gap-4 bg-gray-800 border border-gray-700 hover:border-sky-500 rounded-xl p-4 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-gray-900 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {item.fileUrl ? <img src={item.fileUrl} alt={item.fileName} className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} /> : <Image size={20} className="text-gray-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{item.caption || item.fileName || 'Untitled'}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-gray-500 text-xs flex items-center gap-1"><HardDrive size={11} />{formatFileSize(item.fileSize)}</span>
                  <span className="text-gray-500 text-xs flex items-center gap-1"><Clock size={11} />{formatDate(item.createdAt)}</span>
                  {item.emojis && <span className="text-sm">{item.emojis}</span>}
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"><ExternalLink size={14} /></a>}
                <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="p-2 hover:bg-red-600 text-gray-400 hover:text-white rounded-lg transition-colors">
                  {deleting === item.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showUpload && <MediaUploadModal onClose={() => setShowUpload(false)} onSuccess={load} />}
    </div>
  )
}

// ---- MUSIC SECTION ----
function MusicSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [playing, setPlaying] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const audioRef = useRef(new Audio())

  const load = async () => {
    setLoading(true)
    try {
      const data = await musicApi.getAll()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load music')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    return () => { audioRef.current.pause() }
  }, [])

  const togglePlay = (item) => {
    if (item.isFromYoutube) {
      setExpanded(prev => prev === item.id ? null : item.id)
      return
    }
    if (!item.fileUrl) return
    if (playing === item.id) {
      audioRef.current.pause()
      setPlaying(null)
    } else {
      audioRef.current.pause()
      audioRef.current.src = item.fileUrl
      audioRef.current.play().then(() => setPlaying(item.id)).catch(() => toast.error('Cannot play audio'))
      audioRef.current.onended = () => setPlaying(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this track?')) return
    if (playing === id) { audioRef.current.pause(); setPlaying(null) }
    setDeleting(id)
    try {
      await musicApi.delete(id)
      toast.success('Deleted successfully')
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = items.filter(i =>
    (i.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.fileName || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Music Library</h1>
          <p className="text-gray-400 text-sm mt-0.5">{items.length} tracks</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"><RefreshCw size={16} /></button>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"><Plus size={16} /> Add Music</button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search music..." className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors" />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={32} className="animate-spin text-purple-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Music size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500">No music tracks found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, idx) => {
            const ytId = getYoutubeId(item.youtubeUrl)
            const isExpanded = expanded === item.id
            return (
              <div key={item.id} className={`border rounded-xl overflow-hidden transition-all group ${
                playing === item.id ? 'bg-purple-900/30 border-purple-500' :
                isExpanded ? 'bg-gray-800 border-red-500/60' :
                'bg-gray-800 border-gray-700 hover:border-purple-500'
              }`}>
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-shrink-0 w-10 text-center">
                    <span className="text-gray-600 text-sm font-mono">{String(idx + 1).padStart(2, '0')}</span>
                  </div>

                  {/* Thumbnail YouTube hoặc nút play */}
                  {item.isFromYoutube && ytId ? (
                    <button
                      onClick={() => togglePlay(item)}
                      className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 relative group/thumb"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                        {isExpanded ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white ml-0.5" />}
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => togglePlay(item)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        playing === item.id ? 'bg-purple-500 hover:bg-purple-400' : 'bg-gray-700 hover:bg-purple-600'
                      }`}
                    >
                      {playing === item.id ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
                    </button>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.title || item.fileName || 'Untitled'}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {item.isFromYoutube ? (
                        <span className="text-red-400 text-xs flex items-center gap-1"><Youtube size={11} />YouTube</span>
                      ) : (
                        <span className="text-gray-500 text-xs flex items-center gap-1"><HardDrive size={11} />{formatFileSize(item.fileSize)}</span>
                      )}
                      <span className="text-gray-500 text-xs flex items-center gap-1"><Clock size={11} />{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.isFromYoutube && item.youtubeUrl && (
                      <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-700 text-gray-400 hover:text-red-400 rounded-lg transition-colors"><ExternalLink size={14} /></a>
                    )}
                    {item.fileUrl && !item.isFromYoutube && (
                      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"><ExternalLink size={14} /></a>
                    )}
                    <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="p-2 hover:bg-red-600 text-gray-400 hover:text-white rounded-lg transition-colors">
                      {deleting === item.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                {/* YouTube embed */}
                {item.isFromYoutube && ytId && isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="rounded-xl overflow-hidden aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {showUpload && <MusicUploadModal onClose={() => setShowUpload(false)} onSuccess={load} />}
    </div>
  )
}

// ---- MAIN APP ----
export default function App() {
  const [activeSection, setActiveSection] = useState('media')

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' } }} />

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center">
              <Film size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">AppSory</h1>
              <p className="text-gray-500 text-xs mt-0.5">Media Manager</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-gray-600 text-xs font-medium uppercase tracking-wider px-3 mb-3">Library</p>
          {[
            { id: 'media', label: 'Media', icon: Image, color: 'text-sky-400', bg: 'bg-sky-500/10' },
            { id: 'music', label: 'Music', icon: Music, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map(({ id, label, icon: Icon, color, bg }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                activeSection === id
                  ? `${bg} ${color} border border-current/20`
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              {label}
              {activeSection === id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <a href="https://demosorry-production.up.railway.app/swagger/v1/swagger.json" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-xs transition-colors">
            <ExternalLink size={12} />
            API Documentation
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {activeSection === 'media' && <MediaSection />}
          {activeSection === 'music' && <MusicSection />}
        </div>
      </main>
    </div>
  )
}
