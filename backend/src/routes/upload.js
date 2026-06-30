import express from 'express'
import multer from 'multer'
import path from 'path'
import { promises as fs } from 'fs'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads')
    try {
      await fs.mkdir(uploadDir, { recursive: true })
      cb(null, uploadDir)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex')
    const ext = path.extname(file.originalname)
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_')
    cb(null, `${baseName}_${uniqueSuffix}${ext}`)
  }
})

// File filter - only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// Upload file endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { meetingId, senderId, senderName, message } = req.body

    if (!meetingId || !senderId || !senderName) {
      // Delete uploaded file if validation fails
      await fs.unlink(req.file.path)
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Generate file URL (assuming backend is on same domain or use full URL)
    const fileUrl = `/uploads/${req.file.filename}`

    console.log('[Upload] File uploaded:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      meetingId,
      senderId,
      senderName
    })

    res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    })
  } catch (error) {
    console.error('[Upload] Error:', error)
    res.status(500).json({ error: 'File upload failed' })
  }
})

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(__dirname, '../../uploads', filename)
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('[Upload] Error serving file:', err)
      res.status(404).json({ error: 'File not found' })
    }
  })
})

export default router
