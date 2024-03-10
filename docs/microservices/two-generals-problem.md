# Two generals problem

ระหว่างที่เรากำลังออกแบบ microservices หนึ่งในปัญหาที่มักจะเจอก็คือ ทำยังไงให้ข้อมูลที่อยู่ใน 2 service ใดๆนั้นเท่ากัน หรือก็คือ ทำยังไงให้ data มัน consistent

สมมติว่ามี service A และ service B ที่เก็บข้อมูล order ทั้งหมดในระบบ เมื่อไหร่ก็ตามที่ order ถูกสร้างขึ้นใน service A, service B จะต้อง replicate order นั้นๆไปด้วย

โดยใน design เราจะให้ service A ทำ asynchronous call ไปที่ service B ทุกๆครั้งที่มี order เกิดขึ้นที่ service A

```plantuml
"Service A" --> "Service B" : Order created
note over "Service B": Save new order in DB
note over "Service A": Save new order in DB
```

จะเห็นว่าในกรณีที่ service B ไม่ได้รับ message service A ไม่สามารถรับรู้ได้เลย ทำให้ service A มีข้อมูล order อยู่
แต่ฝั่ง service B ไม่มีข้อมูล order นี้อยู่เลย ทำให้เกิด data inconsistent ในระบบ

```plantuml
"Service A" -->x "Service B" : Order created
note over "Service A" : Save new order in DB
```

วิธีที่ดูเหมือนจะแก้ปัญหาได้ก็คือให้ service B ตอบ acknowledge กลับไปหา service A ด้วยเมื่อทำงานสำเร็จ
และ service A จะรอ acknowledgement จาก service B จึงค่อย save order นั้นๆลง Database

```plantuml
"Service A" --> "Service B" : Order created
note over "Service B": Save new order in DB
"Service B" --> "Service A": Ack
note over "Service A": Save new order in DB
```

แต่จะเห็นว่าถ้า acknowledge จาก service B เกิด message lost ขึ้นมา จะทำให้ service B มี order แต่ service A จะไม่มี order นี้อยู่

```plantuml
"Service A" --> "Service B" : Order created
note over "Service B" : Save new order in DB
"Service B" -->x "Service A" : Ack
```

เราอาจจะคิดต่อว่า งั้นทำเหมือนเดิมเลย ให้ service A Ack กลับไปที่ service B ด้วยเพื่อให้ service B รับรู้ว่า service A สร้าง order สำเร็จแล้ว
จึงค่อย commit transaction ฝั่งตัวเอง

```plantuml
"Service A" --> "Service B" : Order created
note over "Service B" : Save new order in DB
"Service B" --> "Service A" : Ack
note over "Service A": Save new order in DB
"Service A" --> "Service B" : Ack of Ack
note over "Service B": Commit order
```

จะเห็นได้ว่า process นี้ไม่สามารถจบการทำงานได้จริงๆ message lost อาจจะเกิดขึ้นได้เรื่อยๆ ทำให้ไม่มีจุดไหนเลยที่เราจะมั่นใจได้เลยว่าข้อมูลในทั้ง 2 service นั้นเท่ากันจริงๆ

```plantuml
"Service A" --> "Service B" : Order created
note over "Service B" : Save new order in DB
"Service B" --> "Service A" : Ack
note over "Service A": Save new order in DB
"Service A" -->x "Service B" : Ack of Ack
```

โดยทั่วไปแล้วปัญหา two generals problem จะเกิดขึ้นได้ เมื่อ 2 service สื่อสารกันผ่านตัวกลางที่ service ต้นทาง ไม่สามารถ confirm ได้ว่า message ถูก delivery ได้สำเร็จ
