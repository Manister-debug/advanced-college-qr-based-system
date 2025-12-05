# QR Code Attendance System - Database

نظام إدارة الحضور باستخدام رموز QR - قاعدة البيانات

## نظرة عامة

هذا المشروع يحتوي على قاعدة بيانات شاملة لنظام تتبع الحضور الطلابي باستخدام رموز QR. يدعم النظام إدارة الطلاب والمحاضرين والدورات والمحاضرات وسجلات الحضور.

## محتويات المشروع

```
QR_Code_Attendees_DB/
├── 01_create_tables.sql          # ملف إنشاء جداول قاعدة البيانات
├── 02_insert_sample_data.sql     # ملف إدراج البيانات النموذجية
├── README.md                      # هذا الملف
├── .gitignore                     # ملف تجاهل Git
└── DATABASE_SCHEMA.md             # توثيق شامل للمخطط
```

## الجداول الرئيسية

### 1. **Students** (الطلاب)
- تخزين معلومات الطلاب الأساسية
- الحقول: UNI_ID, PASS, Full_Name, Phone_Number, email, Branch

### 2. **lecturer** (المحاضرون)
- معلومات المحاضرين والمدرسين
- الحقول: ID_lecturer, Full_Name, Specialization, Role, Phone_Number, email

### 3. **Courses** (الدورات/المقررات)
- قائمة المقررات الدراسية
- الحقول: ID_course, Cours_Name, Symbol_course, Credt_Hour, Courses_type

### 4. **Lecture_Time** (أوقات المحاضرات)
- جدول المحاضرات والجداول الزمنية
- الحقول: Lecture_ID, ID_course, ID_lecturer, Lecture_Date, Start_Time, End_Time

### 5. **Attendees_Name** (سجلات الحضور)
- تسجيل حضور الطلاب في المحاضرات
- الحقول: UNI_ID, Lecture_ID

### 6. **Name_Student_Cours** (تسجيل الطلاب في الدورات)
- ربط الطلاب بالمقررات المسجلة فيها
- الحقول: UNI_ID, ID_course

### 7. **Users** (المستخدمون)
- حسابات المستخدمين (محاضرون، مسؤولون، منسقون)
- الحقول: User_ID, Username, Password, Role

### 8. **Dean_of_colleges_Admin** (عميد الكلية)
- معلومات المسؤولين الإداريين
- الحقول: ID, Full_Name, Specialization, Role, Phone_Number, email

### 9. **coordinators_Sub_Admin** (منسقو الأقسام)
- معلومات منسقي الأقسام الفرعيين
- الحقول: ID, Full_Name, Specialization, Role, Phone_Number, email

## المتطلبات

- **قاعدة البيانات**: SQL Server 2012 أو أحدث
- **الترميز**: UTF-8
- **اللغة**: T-SQL

## التثبيت والاستخدام

### 1. إنشاء قاعدة البيانات

```sql
-- أنشئ قاعدة البيانات أولاً
CREATE DATABASE QR_Code_Attendees;
```

### 2. تنفيذ ملف إنشاء الجداول

```bash
# في SQL Server Management Studio أو أي أداة SQL
sqlcmd -S <server_name> -d QR_Code_Attendees -i 01_create_tables.sql
```

أو انسخ ولصق محتوى الملف مباشرة في محرر SQL.

### 3. إدراج البيانات النموذجية (اختياري)

```bash
sqlcmd -S <server_name> -d QR_Code_Attendees -i 02_insert_sample_data.sql
```

## العلاقات بين الجداول

```
Students ──┬─→ Name_Student_Cours ──→ Courses
           │
           └─→ Attendees_Name ──→ Lecture_Time ──┬─→ Courses
                                                  │
                                                  └─→ lecturer

Users ←─── lecturer, Dean_of_colleges_Admin, coordinators_Sub_Admin
```

## القيود والتحقق من البيانات

### المفاتيح الأساسية (Primary Keys)
- Students: UNI_ID
- lecturer: ID_lecturer
- Courses: ID_course
- Lecture_Time: Lecture_ID
- Users: User_ID

### المفاتيح الأجنبية (Foreign Keys)
- Lecture_Time.ID_course → Courses.ID_course
- Lecture_Time.ID_lecturer → lecturer.ID_lecturer
- Name_Student_Cours.UNI_ID → Students.UNI_ID
- Name_Student_Cours.ID_course → Courses.ID_course
- Attendees_Name.UNI_ID → Students.UNI_ID
- Attendees_Name.Lecture_ID → Lecture_Time.Lecture_ID

### القيود الفريدة (Unique Constraints)
- Phone_Number و email في جميع جداول المستخدمين (فريدة)
- Username في جدول Users (فريد)

### قيود التحقق (Check Constraints)
- Courses_type: يجب أن تكون 'T' أو 'P' أو 'T,P'
- Lecture_Time_range: End_Time يجب أن تكون أكبر من Start_Time

## البيانات النموذجية

تم تضمين بيانات نموذجية في الملف `02_insert_sample_data.sql`:

- **4 طلاب** من تخصصات مختلفة
- **3 محاضرين** متخصصين في مجالات مختلفة
- **4 مقررات** دراسية
- **4 محاضرات** مجدولة
- **سجلات حضور** نموذجية
- **حسابات مستخدم** للمسؤولين والمحاضرين

## الملاحظات الأمنية

⚠️ **تحذير**: البيانات النموذجية تحتوي على كلمات مرور بسيطة للاختبار فقط. في بيئة الإنتاج:

- استخدم كلمات مرور قوية ومشفرة
- قم بتشفير كلمات المرور باستخدام خوارزميات آمنة (مثل bcrypt أو PBKDF2)
- لا تخزن كلمات المرور بنص عادي
- استخدم HTTPS لجميع الاتصالات

## التطوير والصيانة

### إضافة جدول جديد

1. أنشئ ملف SQL جديد بصيغة `03_add_new_table.sql`
2. اتبع نفس معايير التنسيق والتعليقات
3. تأكد من العلاقات والقيود

### تعديل الجداول الموجودة

1. استخدم أوامر ALTER TABLE
2. اختبر التغييرات على نسخة اختبار أولاً
3. وثق التغييرات في ملف منفصل

## المساهمة

إذا كنت تريد المساهمة في تحسين قاعدة البيانات:

1. انسخ المشروع (Fork)
2. أنشئ فرع جديد للميزة (`git checkout -b feature/improvement`)
3. قم بالتعديلات المطلوبة
4. اختبر التغييرات جيداً
5. أرسل طلب دمج (Pull Request)

## الترخيص

هذا المشروع مرخص تحت رخصة MIT. انظر ملف LICENSE للتفاصيل.

## الدعم والمساعدة

للأسئلة أو الإبلاغ عن المشاكل:

- افتح issue على GitHub
- تواصل مع فريق التطوير

## السجل التاريخي

### الإصدار 1.0 (2025-01-12)
- الإصدار الأول من قاعدة البيانات
- تضمين جميع الجداول الأساسية
- إضافة البيانات النموذجية

---

**آخر تحديث**: 2025-01-12  
**الإصدار**: 1.0.0
