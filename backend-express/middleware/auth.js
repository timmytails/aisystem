const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' })
        }

        // Enforce account ban check for non-admin users
        if (req.user && req.user.role !== 'admin') {
            const Notification = require('../models/Notification')
            const lastNotif = await Notification.findOne({ targetUser: req.user._id }).sort({ createdAt: -1 })

            if (lastNotif) {
                const text = (String(lastNotif.title || '') + ' ' + String(lastNotif.message || '')).toLowerCase()
                if (text.includes('banned') || text.includes('ban account')) {
                    if (req.user.accountStatus !== 'banned') {
                        req.user.accountStatus = 'banned'
                        req.user.statusReason = lastNotif.message || ''
                        await User.findByIdAndUpdate(req.user._id, { accountStatus: 'banned', statusReason: req.user.statusReason }).catch(() => {})
                    }
                } else if (text.includes('restored') || text.includes('privileges restored')) {
                    if (req.user.accountStatus === 'banned') {
                        req.user.accountStatus = 'active'
                        req.user.statusReason = ''
                        await User.findByIdAndUpdate(req.user._id, { accountStatus: 'active', statusReason: '' }).catch(() => {})
                    }
                }
            }

            if (req.user.accountStatus === 'banned') {
                return res.status(403).json({
                    success: false,
                    isBanned: true,
                    message: `Your customer account has been suspended by salon administration. ${req.user.statusReason ? `Reason: ${req.user.statusReason}` : ''}`
                })
            }
        }

        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, token invalid' })
    }
}

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next()
    } else {
        res.status(403).json({ success: false, message: 'Admin access required' })
    }
}

const optionalProtect = async (req, _res, next) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) return next()

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')
    } catch {
        req.user = null
    }
    next()
}

module.exports = { protect, adminOnly, optionalProtect }
