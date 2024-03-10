# Distributed locking

โดยทั่วไปแล้ว resource บางอย่างในระบบ ไม่ควรจะถูก access ได้พร้อมกันโดยหลาย process ไม่งั้นอาจจะทำให้เกิด race condition ได้
ยกตัวอย่างเช่น record ใน database เรายอมให้ 1 record ถูกอ่านได้พร้อมกันในหลายๆ process แต่โดยปกติเราจะไม่ยอมให้ record ถูก update ได้พร้อมๆกัน

ตัวอย่าง Bob และ Alice ต้องการจะเพิ่มค่าของตัวแปร count แต่ process ดันเข้ามา access ตัวแปร count ได้พร้อมๆกัน

```plantuml
hide footbox
participant Bob
database DB
participant Alice
note over DB : count = 10
"Bob" -> "DB" : Get count
"DB" -> "Bob" : Return count = 10
"DB" <- "Alice" : Get count
"DB" -> "Alice" : Return count = 10
"Bob" -> "DB" : Update count = count + 5
note over "DB" : count = 15
"DB" <- "Alice" : Update count = count + 10
note over "DB" : count = 20
```

ค่าสุดท้ายของ count คือ 20 ซึ่งไม่ถูก จริงๆควรจะเป็น 25

จริงๆแล้วปัญหานี้แก้ได้ไม่ยากด้วยการใช้ database transaction ซึ่งมันจะจัดการ concurrency control ให้เราได้ ด้วย mechanic ต่างๆ เช่น optimistic lock, pessimistic lock

แล้วถ้า resource ของเราไม่ได้อยู่ใน database ล่ะ เช่นอาจจะเป็น file ที่ถูกเก็บอยู่ใน blob storage ซักที่นึง แล้วดันมีหลาย service ที่ต้องการเข้ามาอ่านและ update content ของ file นี้พร้อมๆกัน

```plantuml
hide footbox
participant "Service A"
database "Blob storage"
participant "Service B"
note over "Blob storage" : current file content = "abc"
"Service A" -> "Blob storage" : Get file a.txt
"Blob storage" -> "Service A" : Return file a.txt
"Blob storage" <- "Service B" : Get file a.txt
"Blob storage" -> "Service B" : Return file a.txt
note over "Service A" : Append "abc" to file content
"Service A" -> "Blob storage" : Update a.txt content
note over "Blob storage" : current file content = "abcabc"
note over "Service B" : Append "abc" to file content
"Blob storage" <- "Service B" : Update a.txt content
note over "Blob storage" : current file content = "abcabc"
```

content สุดท้ายของ a.txt คือ `abcabc` ซึ่งไม่ถูก จริงๆควรจะเป็น `abcabcabc`

ตอนนี้เราไม่สามารถโยน concurrency control ไปให้ database จัดการให้เราได้แล้ว ดังนั้นเราต้องจัดการ concurrency control ใน application layer แทนที่จะเป็น database layer

โดยไอเดียของ distributed locking คือเราจะมี global lock ตัวนึง ที่สามารถเข้าถึงได้โดยทุก service ทำหน้าที่ lock resource ที่เราไม่อยากให้ถูก access ได้พร้อมๆกันโดยหลาย service

ตัว global lock ของเราจะ provide 2 operations คือ AcquireLock และ ReleaseLock

- AcquireLock รับ parameter `key` เป็นตัวอ้างอิงว่าเรากำลังจะ lock resource ไหน เมื่อ resource ถูก lock อยู่ จะไม่มี service ไหนเข้ามา acquire lock ด้วย key นั้นๆได้อีก 
โดยจำเป็นจะต้องรอให้ service ก่อนหน้า ReleaseLock ก่อน (อาจจะทำ polling จนกว่าจะ AcquireLock ได้สำเร็จ)
- ReleaseLock รับ parameter `key` เป็นตัวอ้างอิงว่าเราจะ release lock ของ resource ไหน

```plantuml
hide footbox
hide footbox
participant "Service A"
participant "Global lock"
database "Blob storage"
participant "Service B"
note over "Blob storage" : current file content = "abc"
"Service A" -> "Global lock" : AcquireLock with key "a.txt"
"Service A" <- "Global lock" : Return OK
note over "Global lock" : "a.txt" locked

loop polling every xxx ms
"Global lock" <- "Service B" : AcquireLock with key "a.txt"
"Global lock" -> "Service B" : Return already locked
end

"Service A" -> "Blob storage" : Get file a.txt
"Blob storage" -> "Service A" : Return file a.txt

note over "Service A" : Append "abc" to file content
"Service A" -> "Blob storage" : Update a.txt content
note over "Blob storage" : current file content = "abcabc"

"Service A" -> "Global lock" : ReleaseLock with key "a.txt"
note over "Global lock" : "a.txt" unlocked

"Global lock" <- "Service B" : AcquireLock with key "a.txt"
"Global lock" -> "Service B" : Return OK

note over "Global lock" : "a.txt" locked

"Blob storage" <- "Service B" : Get file a.txt
"Blob storage" -> "Service B" : Return file a.txt

note over "Service B" : Append "abc" to file content
"Blob storage" <- "Service B" : Update a.txt content
note over "Blob storage" : current file content = "abcabcabc"

"Blob storage" <- "Service B" : ReleaseLock with key "a.txt"
note over "Global lock" : "a.txt" unlocked
```

จะเห็นว่าเพียงเท่านี้ content สุดท้ายของ a.txt นั้นถูกต้องแล้ว

โดยปกติแล้ว global lock จะถูก implement ด้วย in-memory database เช่น redis เพื่อให้ได้ performance ที่ดี
อย่างไรก็ตามสังเกตว่า เรากำลังบังคับ concurrent process ให้กลายเป็น sequential process อยู่ หมายความว่าถ้าระบบของเราใช้ distributed lock มากเกินไป
ก็อาจจะเกิด performance issue อยู่ดี อีกทั้ง global lock อาจจะกลายเป็น single point of failure ในระบบ

สำหรับตัวอย่าง implementation ของ distributed lock สามารถอ่านต่อได้ใน [documentation ของ redis](https://redis.io/docs/manual/patterns/distributed-locks/)
ซึ่งจะเป็นการนำ redis มา apply เป็น global lock และยังมี opensource library พร้อมใช้งาน รองรับหลายภาษา
