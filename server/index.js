// server/index.js (FULL CODE WITH MESSAGES & REAL STATS)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect('mongodb://127.0.0.1:27017/myLocalDB')
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect", err));

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
    name: String, email: String, password: String,
    role: { type: String, default: "Student" },
    joinDate: { type: Date, default: Date.now },
    profilePic: { type: String, default: "" },
    enrolledCourses: [{ 
        courseId: String, title: String, thumbnail: String, progress: { type: Number, default: 0 },
        completedVideos: { type: [Number], default: [] }, completedQuizzes: { type: [Number], default: [] } 
    }]
});
const UserModel = mongoose.model("users", UserSchema);

const CourseSchema = new mongoose.Schema({
    title: String, description: String, price: Number, thumbnail: String,
    instructorId: String, instructorName: String,
    views: { type: Number, default: 0 }, videoCount: { type: Number, default: 0 },
    enrolled: { type: Number, default: 0 }, revenue: { type: Number, default: 0 },
    dateCreated: { type: Date, default: Date.now },
    reviews: [{
    studentId: String,
    studentName: String,
    studentProfilePic: String, // <--- ADD THIS LINE
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
}],
    averageRating: { type: Number, default: 0 },
    videos: [{
        title: String, videoPath: String, thumbnailPath: String,
        resources: [{ title: String, filePath: String }],
        quizzes: [{ question: String, options: [String], correctAns: String }]
    }]
});
const CourseModel = mongoose.model("courses", CourseSchema);

// NEW: MESSAGE SCHEMA (For Contact Form)
const MessageSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    date: { type: Date, default: Date.now }
});
const MessageModel = mongoose.model("messages", MessageSchema);


// --- MULTER SETUP ---
const directories = ['uploads', 'uploads/videos', 'uploads/thumbnails', 'uploads/resources', 'uploads/profiles'];
directories.forEach(dir => {
    if (!fs.existsSync(path.join(__dirname, dir))) fs.mkdirSync(path.join(__dirname, dir));
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'courseThumbnail' || file.fieldname.includes('thumb')) {
            cb(null, 'uploads/thumbnails/');
        } else if (file.mimetype.startsWith('video')) {
            cb(null, 'uploads/videos/');
        } else if (file.fieldname === 'profilePic') { // <--- NEW CHECK
            cb(null, 'uploads/profiles/');
        } else {
            cb(null, 'uploads/resources/');
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-')); 
    }
});
const upload = multer({ storage: storage });


// --- ROUTES ---

// Auth
app.post('/register', (req, res) => { UserModel.create(req.body).then(users => res.json(users)).catch(err => res.json(err)); });
app.post('/login', (req, res) => {
    const { email, password, role } = req.body;
    UserModel.findOne({ email: email }).then(user => {
        if (user) {
            if (user.password === password) {
                if(user.role === role) res.json({status: "Success", user: user});
                else res.json({status: "Role mismatch!"});
            } else res.json({status: "Wrong password"});
        } else res.json({status: "No user found"});
    });
});
app.get('/user/:id', (req, res) => { UserModel.findById(req.params.id).then(user => res.json(user)).catch(err => res.json(err)); });

// Course & Progress
app.get('/courses', (req, res) => { CourseModel.find().then(courses => res.json(courses)).catch(err => res.json(err)); });
app.get('/instructor-courses/:id', (req, res) => { CourseModel.find({ instructorId: req.params.id }).then(courses => res.json(courses)).catch(err => res.json(err)); });
app.get('/course/:id', (req, res) => { CourseModel.findById(req.params.id).then(course => res.json(course)).catch(err => res.json(err)); });

app.post('/add-course', upload.any(), async (req, res) => {
    try {
        const courseData = JSON.parse(req.body.courseData);
        const files = req.files;
        const getPath = (fieldname) => { const f = files.find(x => x.fieldname === fieldname); return f ? `http://localhost:3001/${f.destination}${f.filename}` : ""; };
        courseData.thumbnail = getPath('courseThumbnail');
        courseData.videos.forEach((v, i) => {
            v.videoPath = getPath(`video_${i}`); v.thumbnailPath = getPath(`videoThumb_${i}`);
            v.resources.forEach((r, ri) => r.filePath = getPath(`resource_${i}_${ri}`));
        });
        courseData.videoCount = courseData.videos.length;
        const newCourse = await CourseModel.create(courseData);
        res.json({ status: "Success", course: newCourse });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/edit-course/:id', upload.any(), async (req, res) => {
    try {
        const courseData = JSON.parse(req.body.courseData);
        const files = req.files;
        const getPath = (fieldname, old) => { const f = files.find(x => x.fieldname === fieldname); return f ? `http://localhost:3001/${f.destination}${f.filename}` : old; };
        courseData.thumbnail = getPath('courseThumbnail', courseData.thumbnail);
        courseData.videos.forEach((v, i) => {
            v.videoPath = getPath(`video_${i}`, v.videoPath); v.thumbnailPath = getPath(`videoThumb_${i}`, v.thumbnailPath);
            v.resources.forEach((r, ri) => r.filePath = getPath(`resource_${i}_${ri}`, r.filePath));
        });
        courseData.videoCount = courseData.videos.length;
        const updated = await CourseModel.findByIdAndUpdate(req.params.id, courseData, { new: true });
        res.json({ status: "Success", course: updated });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/course/:id', (req, res) => { CourseModel.findByIdAndDelete(req.params.id).then(() => res.json({ status: "Success" })).catch(err => res.json(err)); });
app.post('/course/views/:id', async (req, res) => { await CourseModel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }); res.json({ status: "Success" }); });

// Reviews
// REVIEWS: Add or Update
app.post('/course/review/:id', async (req, res) => {
    const { studentId, studentName, studentProfilePic, rating, comment } = req.body;
    
    try {
        const course = await CourseModel.findById(req.params.id);
        
        // 1. Check if user already reviewed this course
        const existingIndex = course.reviews.findIndex(r => r.studentId === studentId);

        if (existingIndex !== -1) {
            // UPDATE EXISTING REVIEW
            course.reviews[existingIndex].rating = rating;
            course.reviews[existingIndex].comment = comment;
            course.reviews[existingIndex].date = Date.now();
            // Update profile info in case they changed it
            course.reviews[existingIndex].studentName = studentName;
            course.reviews[existingIndex].studentProfilePic = studentProfilePic;
        } else {
            // ADD NEW REVIEW
            course.reviews.push({ 
                studentId, 
                studentName, 
                studentProfilePic, 
                rating, 
                comment 
            });
        }

        // 2. Recalculate Average (Math fix)
        // We assume 'averageRating' is 0 if no reviews exist.
        if (course.reviews.length > 0) {
            const total = course.reviews.reduce((acc, item) => acc + item.rating, 0);
            course.averageRating = (total / course.reviews.length).toFixed(1);
        } else {
            course.averageRating = 0;
        }
        
        await course.save();
        res.json({ status: "Success", course: course });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// Purchasing & Progress
app.post('/purchase', async (req, res) => {
    const { userId, cartItems } = req.body;
    try {
        const enrollments = cartItems.map(item => ({ courseId: item._id, title: item.title, thumbnail: item.thumbnail }));
        const user = await UserModel.findByIdAndUpdate(userId, { $push: { enrolledCourses: { $each: enrollments } } }, { new: true });
        await Promise.all(cartItems.map(item => CourseModel.findByIdAndUpdate(item._id, { $inc: { enrolled: 1, revenue: item.price } })));
        res.json({ status: "Success", user: user });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/update-progress', async (req, res) => {
    const { userId, courseId, progress, completedVideos, completedQuizzes } = req.body;
    try {
        await UserModel.updateOne({ _id: userId, "enrolledCourses.courseId": courseId }, 
        { $set: { "enrolledCourses.$.progress": progress, "enrolledCourses.$.completedVideos": completedVideos, "enrolledCourses.$.completedQuizzes": completedQuizzes } });
        res.json({ status: "Success" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ADMIN & LANDING ROUTES ---

// 1. ADMIN STATS
app.get('/admin/stats', async (req, res) => {
    try {
        const userCount = await UserModel.countDocuments();
        const courseCount = await CourseModel.countDocuments();
        const allCourses = await CourseModel.find();
        const totalRevenue = allCourses.reduce((acc, curr) => acc + curr.revenue, 0);
        res.json({ users: userCount, courses: courseCount, revenue: totalRevenue });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. HOME STATS (PUBLIC) - Updated for Real Reviews & Avg Rating
app.get('/home/stats', async (req, res) => {
    try {
        const totalCourses = await CourseModel.countDocuments();
        const totalStudents = await UserModel.countDocuments({ role: 'Student' });
        const totalInstructors = await UserModel.countDocuments({ role: 'Instructor' });
        
        // --- FIX STARTS HERE ---
        const allCourses = await CourseModel.find().select('averageRating reviews title');
        
        // 1. Filter out courses that have NO rating (averageRating is 0 or undefined)
        const coursesWithRatings = allCourses.filter(c => c.averageRating > 0);

        // 2. Sum up the ratings of VALID courses only
        const totalRatingsSum = coursesWithRatings.reduce((acc, c) => acc + c.averageRating, 0);
        
        // 3. Divide by the count of VALID courses (not total courses)
        const globalAvg = coursesWithRatings.length > 0 
            ? (totalRatingsSum / coursesWithRatings.length).toFixed(1) 
            : 0;
        // --- FIX ENDS HERE ---

        // Gather Recent Reviews (Logic remains the same)
        let allReviews = [];
        allCourses.forEach(c => {
            if(c.reviews) {
                const courseReviews = c.reviews.map(r => ({...r.toObject(), courseTitle: c.title}));
                allReviews.push(...courseReviews);
            }
        });
        allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentReviews = allReviews.slice(0, 3);

        res.json({ 
            courses: totalCourses, 
            students: totalStudents, 
            instructors: totalInstructors,
            averageRating: globalAvg,
            reviews: recentReviews
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. USER MANAGEMENT
app.get('/users', (req, res) => { UserModel.find().then(u => res.json(u)); });
app.delete('/user/:id', async (req, res) => {
    const u = await UserModel.findById(req.params.id);
    if(u.role === "Super Admin") return res.json({status:"Error"});
    await UserModel.findByIdAndDelete(req.params.id);
    res.json({status:"Success"});
});
app.put('/admin/user/:id', async (req, res) => {
    const { name, email, role, password } = req.body;
    const update = { name, email, role };
    if(password) update.password = password;
    await UserModel.findByIdAndUpdate(req.params.id, update);
    res.json({status:"Success"});
});

// 4. CONTACT MESSAGES
app.post('/contact', async (req, res) => {
    try {
        await MessageModel.create(req.body);
        res.json({ status: "Success" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/admin/messages', async (req, res) => {
    try {
        const messages = await MessageModel.find().sort({ date: -1 });
        res.json(messages);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPLOAD PROFILE PIC ROUTE
app.post('/user/upload-pic', upload.single('profilePic'), async (req, res) => {
    try {
        const userId = req.body.userId;
        const file = req.file;
        if (!file) return res.status(400).json({ error: "No file uploaded" });

        const filePath = `http://localhost:3001/uploads/profiles/${file.filename}`;

        // Update User in DB
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId, 
            { profilePic: filePath }, 
            { new: true } // Return updated doc
        );

        res.json({ status: "Success", user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3001, () => { console.log("Server running on 3001"); });
// [2025-11-25] style: polish typography hierarchy and mobile drawer navigation

// [2025-11-25] feat(gamification): add daily learning streak tracker and achievement badges

// [2025-11-25] feat(notifications): design lesson reminders and course update alerts

// [2025-11-26] refactor(state): optimize lesson completion state management

// [2025-11-27] test: verify responsive layout on tablet and mobile viewports

// [2025-11-27] feat(footer): add platform footer with support links and social icons

// [2025-11-28] chore: polish UI transitions and prepare initial release candidate

// [2025-11-29] feat(analytics): draft basic student engagement metrics view

// [2025-11-30] refactor(styles): clean up redundant CSS rules and utility classes

// [2025-11-30] docs: document component architecture and course model interfaces

// [2025-12-01] feat(player): add playback speed controls (0.75x, 1.25x, 1.5x, 2x)

// [2025-12-02] feat(player): implement theater mode and fullscreen toggle

// [2025-12-02] feat(quiz): add countdown timer option for timed quizzes

// [2025-12-03] feat(quiz): display detailed explanations after quiz submission

// [2025-12-03] style: modernize certificate design with border flourishes

// [2025-12-03] feat(courses): add sorting options by highest rated and most popular

// [2025-12-04] feat(auth): add password visibility toggle button on login modal

// [2025-12-08] feat(search): highlight matched search terms in course title

// [2025-12-08] perf: memoize expensive course filter calculations with useMemo

// [2025-12-11] feat(discussion): support upvoting and sorting questions by popularity

// [2025-12-12] feat(notes): support exporting lesson notes as markdown file

// [2025-12-13] Update README.md

// [2025-12-14] refactor(ui): improve responsive breadcrumb navigation on course pages

// [2025-12-14] feat(notifications): add mark all as read button to notifications dropdown

// [2025-12-14] feat(instructor): add revenue summary and student enrollment count stats

// [2025-12-15] style: refine active tab underline indicator with smooth transition

// [2025-12-15] feat(reviews): add star rating filter to show 5-star or 4-star reviews

// [2025-12-16] refactor(components): standardize icon sizes and color tokens

// [2025-12-17] feat(profile): display visual badges for completed courses

// [2025-12-19] feat(player): automatically save and resume video playback position

// [2025-12-19] feat(bookmarks): add quick unfavorite button from student dashboard
