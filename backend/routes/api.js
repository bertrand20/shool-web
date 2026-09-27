const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { requirePermission, requireRoles, authorizeOperational } = require('../middleware/rbac');
const studentController = require('../controllers/studentController');
const attendanceController = require('../controllers/attendanceController');
const financeController = require('../controllers/financeController');
const parentController = require('../controllers/parentController');
const staffController = require('../controllers/staffController');
const adminController = require('../controllers/adminController');
const portalController = require('../controllers/portalController');
const adminContentController = require('../controllers/adminContentController');
const publicRegistrationController = require('../controllers/publicRegistrationController');
const marksController = require('../controllers/marksController');
const timetableController = require('../controllers/timetableController');
const homeworkController = require('../controllers/homeworkController');
const notificationsController = require('../controllers/notificationsController');
const reportsController = require('../controllers/reportsController');
const libraryController = require('../controllers/libraryController');
const transportController = require('../controllers/transportController');
const healthController = require('../controllers/healthController');
const payrollController = require('../controllers/payrollController');
const leaveController = require('../controllers/leaveController');
const eventsController = require('../controllers/eventsController');
const behaviorController = require('../controllers/behaviorController');
const inventoryController = require('../controllers/inventoryController');
const auditController = require('../controllers/auditController');
const certificatesController = require('../controllers/certificatesController');
const contactController = require('../controllers/contactController');

// Public portal routes
router.get('/portal/announcements', portalController.getAnnouncements);
router.get('/portal/gallery', portalController.getGallery);
router.get('/portal/school-info', portalController.getSchoolInfo);
router.post('/portal/register', publicRegistrationController.publicRegister);
router.post('/portal/contact', contactController.createMessage);
router.get('/portal/stats', adminAuth, requirePermission('students:read'), portalController.getStats);
router.get('/portal/search-student', adminAuth, requirePermission('students:read'), portalController.searchStudent);
router.get('/portal/fees/:studentId', adminAuth, requirePermission('finance:read'), portalController.getStudentFees);
router.post('/portal/pay', adminAuth, requirePermission('finance:write'), portalController.submitPayment);

// Deliberately limited public website API. Private school-management data is not exposed here.
router.get('/public/school-info', portalController.getSchoolInfo);
router.get('/public/news', portalController.getAnnouncements);
router.get('/public/events', eventsController.getEvents);
router.get('/public/gallery', portalController.getGallery);
router.get('/public/:section(academics|admissions|student-life|achievements|staff|alumni)', portalController.getPublicContent);

// Admin auth
router.post('/admin/login', adminController.login);
router.post('/admin/forgot-password', adminController.forgotPassword);
router.post('/admin/reset-password', adminController.resetPassword);
router.post('/admin/change-password', adminAuth, adminController.changePassword);

// Admin content management
router.get('/admin/announcements', adminAuth, requirePermission('content:read'), adminContentController.getAllAnnouncements);
router.post('/admin/announcements', adminAuth, requirePermission('content:write'), adminContentController.createAnnouncement);
router.put('/admin/announcements/:id', adminAuth, requirePermission('content:write'), adminContentController.updateAnnouncement);
router.delete('/admin/announcements/:id', adminAuth, requirePermission('content:write'), adminContentController.deleteAnnouncement);

router.get('/admin/gallery', adminAuth, requirePermission('content:read'), adminContentController.getAllGallery);
router.post('/admin/gallery', adminAuth, requirePermission('content:write'), adminContentController.createGalleryItem);
router.delete('/admin/gallery/:id', adminAuth, requirePermission('content:write'), adminContentController.deleteGalleryItem);

router.get('/admin/school-info', adminAuth, requirePermission('content:read'), adminContentController.getSchoolInfo);
router.put('/admin/school-info', adminAuth, requirePermission('content:write'), adminContentController.updateSchoolInfo);
router.get('/admin/contact-messages', adminAuth, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), contactController.getMessages);
router.patch('/admin/contact-messages/:id', adminAuth, requireRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), contactController.updateMessageStatus);

// Admin payment management
router.get('/admin/payments', adminAuth, requirePermission('finance:read'), portalController.adminGetAllPayments);
router.put('/admin/payments/:id', adminAuth, requirePermission('finance:write'), portalController.adminUpdatePayment);
router.delete('/admin/payments/:id', adminAuth, requirePermission('finance:write'), portalController.adminDeletePayment);

// Every operational route below this point requires a valid role and permission.
router.use(adminAuth, authorizeOperational);

// Students
router.get('/students', studentController.getAllStudents);
router.get('/students/:id', studentController.getStudentById);
router.post('/students', studentController.createStudent);
router.put('/students/:id', studentController.updateStudent);
router.delete('/students/:id', studentController.deleteStudent);
router.get('/classes', studentController.getClasses);

// Attendance
router.post('/attendance', attendanceController.markAttendance);
router.get('/attendance', attendanceController.getAttendanceByDate);
router.get('/attendance/student', attendanceController.getStudentAttendance);
router.get('/attendance/summary', attendanceController.getAttendanceSummary);

// Finance
router.get('/fees', financeController.getFees);
router.post('/fees', financeController.createFee);
router.post('/payments', financeController.recordPayment);
router.get('/payments', financeController.getStudentPayments);
router.get('/outstanding', financeController.getOutstandingBalances);
router.get('/revenue', financeController.getRevenueSummary);

// Parents
router.get('/parents', parentController.getAllParents);
router.get('/parents/:id', parentController.getParentById);
router.get('/parents/:id/children', parentController.getParentChildren);
router.post('/parents', parentController.createParent);
router.post('/parents/:id/register-child', parentController.registerChild);
router.put('/parents/:id', parentController.updateParent);
router.delete('/parents/:id', parentController.deleteParent);

// Staff
router.get('/staff', staffController.getAllStaff);
router.get('/staff/stats', staffController.getStaffStats);
router.get('/staff/:id', staffController.getStaffById);
router.post('/staff', staffController.createStaff);
router.put('/staff/:id', staffController.updateStaff);
router.delete('/staff/:id', staffController.deleteStaff);

// Marks & Report Cards
router.get('/subjects', marksController.getSubjects);
router.post('/subjects', marksController.createSubject);
router.delete('/subjects/:id', marksController.deleteSubject);
router.get('/exams', marksController.getExams);
router.post('/exams', marksController.createExam);
router.delete('/exams/:id', marksController.deleteExam);
router.get('/marks', marksController.getMarks);
router.post('/marks', marksController.upsertMarks);
router.delete('/marks/:id', marksController.deleteMark);
router.get('/report-card/:studentId/:examId', marksController.getReportCard);

// Public Report Card
router.get('/portal/report-card/:studentId', marksController.getReportCardByExamName);

// Public: Homework & Events
router.get('/portal/homework', homeworkController.getHomework);
router.get('/portal/events', eventsController.getEvents);

// Timetable
router.get('/timetable', timetableController.getTimetable);
router.get('/timetable/summary', timetableController.getTimetableSummary);
router.post('/timetable', adminAuth, timetableController.createTimetableEntry);
router.put('/timetable/:id', adminAuth, timetableController.updateTimetableEntry);
router.delete('/timetable/:id', adminAuth, timetableController.deleteTimetableEntry);

// Homework
router.get('/homework', homeworkController.getHomework);
router.post('/homework', adminAuth, homeworkController.createHomework);
router.put('/homework/:id', adminAuth, homeworkController.updateHomework);
router.delete('/homework/:id', adminAuth, homeworkController.deleteHomework);

// Notifications
router.get('/notifications/settings', adminAuth, notificationsController.getSettings);
router.put('/notifications/settings', adminAuth, notificationsController.updateSettings);
router.get('/notifications/logs', adminAuth, notificationsController.getLogs);
router.post('/notifications/send', adminAuth, notificationsController.sendManual);
router.post('/notifications/fee-reminders', adminAuth, notificationsController.sendFeeReminders);
router.post('/notifications/attendance-alerts', adminAuth, notificationsController.sendAttendanceAlerts);

// Reports (CSV export)
router.get('/reports/attendance', adminAuth, reportsController.exportAttendance);
router.get('/reports/outstanding-fees', adminAuth, reportsController.exportOutstandingFees);
router.get('/reports/marks', adminAuth, reportsController.exportMarks);
router.get('/reports/payroll', adminAuth, reportsController.exportPayroll);

// Library
router.get('/library/books', libraryController.getBooks);
router.post('/library/books', adminAuth, libraryController.createBook);
router.put('/library/books/:id', adminAuth, libraryController.updateBook);
router.delete('/library/books/:id', adminAuth, libraryController.deleteBook);
router.get('/library/issues', libraryController.getIssues);
router.post('/library/issue', adminAuth, libraryController.issueBook);
router.post('/library/return/:id', adminAuth, libraryController.returnBook);
router.get('/library/summary', libraryController.getLibrarySummary);

// Transport
router.get('/transport/routes', transportController.getRoutes);
router.post('/transport/routes', adminAuth, transportController.createRoute);
router.put('/transport/routes/:id', adminAuth, transportController.updateRoute);
router.delete('/transport/routes/:id', adminAuth, transportController.deleteRoute);
router.get('/transport/stops', transportController.getStops);
router.post('/transport/stops', adminAuth, transportController.createStop);
router.delete('/transport/stops/:id', adminAuth, transportController.deleteStop);
router.get('/transport/assignments', transportController.getAssignments);
router.post('/transport/assign', adminAuth, transportController.assignTransport);
router.delete('/transport/assignments/:id', adminAuth, transportController.deleteAssignment);

// Health
router.get('/health/records', healthController.getHealthRecords);
router.post('/health/records', adminAuth, healthController.createHealthRecord);
router.delete('/health/records/:id', adminAuth, healthController.deleteHealthRecord);
router.get('/health/vaccinations', healthController.getVaccinations);
router.post('/health/vaccinations', adminAuth, healthController.createVaccination);
router.delete('/health/vaccinations/:id', adminAuth, healthController.deleteVaccination);

// Payroll
router.get('/payroll', payrollController.getSlips);
router.get('/payroll/summary', payrollController.getPayrollSummary);
router.post('/payroll/generate', adminAuth, payrollController.generateMonth);
router.put('/payroll/:id', adminAuth, payrollController.updateSlip);

// Leave
router.get('/leave', leaveController.getLeaveRequests);
router.post('/leave', adminAuth, leaveController.createLeaveRequest);
router.put('/leave/:id/status', adminAuth, leaveController.updateLeaveStatus);
router.delete('/leave/:id', adminAuth, leaveController.deleteLeaveRequest);

// Events
router.get('/events', eventsController.getEvents);
router.post('/events', adminAuth, eventsController.createEvent);
router.put('/events/:id', adminAuth, eventsController.updateEvent);
router.delete('/events/:id', adminAuth, eventsController.deleteEvent);

// Behavior
router.get('/behavior', behaviorController.getBehaviorLogs);
router.post('/behavior', adminAuth, behaviorController.createBehaviorLog);
router.delete('/behavior/:id', adminAuth, behaviorController.deleteBehaviorLog);

// Inventory
router.get('/inventory', inventoryController.getItems);
router.get('/inventory/summary', inventoryController.getInventorySummary);
router.post('/inventory', adminAuth, inventoryController.createItem);
router.put('/inventory/:id', adminAuth, inventoryController.updateItem);
router.post('/inventory/:id/adjust', adminAuth, inventoryController.adjustStock);
router.delete('/inventory/:id', adminAuth, inventoryController.deleteItem);

// Audit logs
router.get('/audit-logs', adminAuth, auditController.getLogs);
router.delete('/audit-logs', adminAuth, auditController.clearLogs);

// Certificates
router.get('/certificates/transfer/:studentId', adminAuth, certificatesController.getTransferCertificate);
router.get('/certificates/report-card/:studentId/:examId', adminAuth, certificatesController.getCertificateReportCard);

module.exports = router;
