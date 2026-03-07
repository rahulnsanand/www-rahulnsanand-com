---
title: "Get Started with BigData for dummies [Module 1.1]"
description: "Data being the most valuable resource on planet, ever wanted to learn how petabytes worth of it is pr..."
date: "2020-06-07"
tags:
  - bigdata
  - beginners
  - datascience
  - welcome
coverImage: "/blog-covers/bigdata-module-1-1-cover.webp"
devtoUrl: "https://dev.to/rahulnsanand/introduction-to-bigdata-for-dummies-module-1-1-31o6"
mediumUrl: "https://medium.com/analytics-vidhya/introduction-to-bigdata-for-dummies-module-1-1-9e3eea6e65f"
---
Data being the most valuable resource on planet, ever wanted to learn how petabytes worth of it is processed? Ever wanted to create your own application to learn and manage data on your PC? Here we go then.

Hey Pals, I'm Rahul. I'm a tech enthusiast, a graduate of computer science and passionate about software development. I also go by my YouTube handle "TheFlopGuy".

**If you're here purely for knowledge, save yourself some time and jump to the subject [here](#BigData-Title)!**

*If you are comfortable with lesser information and lesser reading, watch a video on this module here! [Coming soon]*

If you're still reading this, let me make it… Not boring for you. I believe that software development is similar to developing relations between humans across the world. Now replace the word humans with computers. What if I said, learning any platform-independent language like Java, Python, etc. You can communicate with **billions** of devices? Awesome right?

Now if you are here as a beginner to software on the whole and are just catching on to the buzz of BigData and want to dive into it. Perfect landing. You've reached exactly where you should, and that's my awesome segway into…

**Welcome to BigData for Dummies!**

Well, no offence cause I myself was a dummy once. And believe me, learning things as a dummy is a perfect way to get to the root of all problems. You truly understand everything without any exceptions. Bored yet? Okay, let's make it more interesting.

This course is to be considered a basic startup course to get you into the world of big data with some basic concepts.

Here's what the pattern for each module going to be like:

- Uniquely identified by the module number. [Ex: Module 1.1]
- Each Module has a blog and a video (Semi-Independent of each other)
- A mini self-assessment test (No "sign-up" crap)
- If it's a practical Module, there is also a GitHub repository that has all my code and helps files, linked within the YouTube video description, and also the bottom of the blog
- For more help, You can always contact me @theflopguy, everywhere

By the end of this course, you will be capable enough to complete a project that a startup company would give it's Data Scientist.

Alright, Let's learn something. In all these modules I will cover most major technologies that are involved in BigData.

---

Some Major Technologies that we are going to cover in this course are:

- Hadoop
- Hive
- Spark
- Scala

In addition to these, I will also cover some titbit techs that can help you send a mail, set a scheduled job, etc.

*__Send a mail? I know how to do that.__*

*Of course, you do the conventional way. What if I told you, you could send a mail straight from a computers command-line interface? Or rather, what if I told you, you could send a mail to yourself after a process gets completed on your machine. Say you are at a party and you get a mail saying, "Hey boss, your application has started processing data"? That autonomous processing is what we are looking at.*

####**A little about me before we begin**

![JeezDoggo](https://i.giphy.com/media/wpoLqr5FT1sY0/giphy.webp)
*I know right, just can't keep it shut*

I am from this country India, sure you've heard of it. I hope. Southern India, not as exotic as it sounds, but, well, a little bit. I have graduated from one of Indias top private Institute of Technology (Didn't seem like it as I graduated through this shit). And now I want to share my knowledge the best way I can. I am an avid video maker, I love editing video, photos and more than editing, I love programming. I started coding at the age of *calculating* 13. Yes. The year 2010. My first languages were Java and HTML. I then learnt Python, C, PHP and C++ during my education. Using this knowledge, I was able to create apps in android studio, create simple Python applications to send messages across servers and dip a little into Machine Learning and AI. I then educated myself about BigData, Starting off with Hadoop, Hive, Spark, Scala. And the other tidbits. I have been able to complete a full working demo of a project in big data. More on that later.

Alright, that's about it for boredom, let's get started with the course. Introduction. Ugh, hate the introduction part of a subject. It's like the wrapper of a perfectly good burger.

---

##**What is BigData?** <a name="BigData-Title"></a>

Before we begin, one must acknowledge the actual terminology "Data" What is Data? Well, It can be anything. A photo, video, email, voice note, message, anything. One must also remember that the word "Data" is actually a plural term, singular of it being Datum. Which, is just funny sounding. Imagine saying "I need 25 more datums" Anyhow, That sentence might be grammatically wrong, nevertheless. Moving on.

What is BigData, Well, it is relative.

![Brilliant](https://i.giphy.com/media/eE26mRFGxnasU/giphy.webp)

It is a common misconception that BigData is a large amount of data that cannot be handled by any normal computing system. Well, true, generally. You see, BigData is not classified by standards. It is relative. By that, I mean, BigData cannot be defined as "any collection of data larger in size than 10tb is BigData" No. That's not how you define Bigdata.

BigData is basically a term given to classify a set of data that cannot be handled. How is that any different? Well. Imagine this scenario.

A 5-year-old kid can probably remember to complete 2 or 3 tasks at a time in chronological order. But an adult could probably remember to do 15 things at a time. I can barely handle 5. So, In this scenario, a kid cannot remember more than 3 tasks at a time. So for that kid, 5 tasks can be classified as big data, and for an adult who can take 15 tasks at a time. The number would be above 15.

Coming back to computer terminologies. If a 2GB RAM computer cannot handle Google Chrome with 30 tabs AND adobe Photoshop editing a 4K image, that amount of data for that computer can be classified as Bigdata. Whereas for a computer with 8G RAM and a much better processor that same amount of data can be considered normal data.

That being said. Why the term BigData, I could say it is just a cool way of saying "It's more than I can handle" Imagine that. Imagine Facebook saying "We have a lot of data that we cannot handle. We need new technology to handle this data" and then imagine then saying "We have BigData engineers dealing with big data to improve efficiency" Both kinda literally mean the same. But, sound so different.

---

##**Conventional Data Processing Vs BigData?**

####**Data architecture**
Conventional Techniques for managing data uses what we call a centralised database architecture. Basically what this means is, there is one computer, processing a lot of data. Even a simple copy-paste procedure takes minutes to complete pasting a 100gb file. Imagine terabytes of files being copy-pasted by that computer. Would take days right? For a normal human like me who has no value of time, that sounds fine. But for a billion-dollar company, that is just a waste of time. Moreover, imagine the amount of power that a computer will consume, That just increases the cost of it all.

![ExplodingPC](https://i.giphy.com/media/nv99yd56AMNDa/giphy.webp)
*Big problem eh? That's just the tip of the iceberg.*

####**Structured and Unstructured Data**
We are all familiar with the kind of data, right? I hope so. We have voice notes, videos, messages, blah blah. All these can be classified into two major categories. Structure and Unstructured. What is structured data? Maybe you can take a guess at it. Structured data is data that has a fixed format or fields. That's what internet boringly describes it. Interestingly, structured data can be understood like this.

Imagine a table with a perfectly described schema. Schema is basically a blueprint of what a table is defined as.

{% gist https://gist.github.com/theflopguy/7c5a95001191b78579a7ff90861bf88b.js %}

I can program an app that can retrieve all Names from a given table. And I can store it in a file called names.txt

I can be assured that all the data in that text file will have names only. However. Imagine creating an app to read a text file. Any text file. Not just the ones you have created. Every text file can have varied data in it. Essay, story, Blank files, numbers.

And if I applied the same logic and said, "Let's retrieve all the first words from the text files and store it. I cannot be sure I will only get Names. As there could be numbers in the first word, there could be null values too.

Hence, Text files are unstructured. There is not a fixed format that I can read through it. Similarly
List of unstructured data is
- Email: Email has some internal structure thanks to its metadata, and we sometimes refer to it as semi-structured. However, its message field is unstructured and conventional analytics tools cannot read through it.
- Social Media: Data from Facebook, Twitter, LinkedIn.
- Website: YouTube, Instagram, photo sharing sites.
- Mobile data: Text messages, locations.
- Media: MP3, digital photos, audio and video files.

Conventional methods only provide a brief insight to all the data, like, "This is a picture" or "This is a text file" but by using a more efficient BigData processing, we can get things out like "This is a picture of a dog licking an ice cream" or "This is a text file containing the word 'Hello' 15 times"

####**Scaling**
Scaling refers to the demand for the resources and servers required to carry out the computation. Big data is based on the scale-out architecture under which the distributed approaches for computing are employed with more than one server. So, the load of the computation is shared with the single application-based system. However, achieving the scalability in the conventional database is very difficult because the conventional database runs on a single server and requires expensive servers to scale up

####**The higher cost of conventional data**
Conventional database system requires complex and expensive hardware and software in order to manage a large amount of data. Also moving the data from one system to another requires more number of hardware and software resources which increases the cost significantly. While in the case of big data as the massive amount of data is segregated between various systems, the amount of data decreases. So the use of big data is quite simple, makes use of commodity hardware and open-source software to process the data

---

##**Characteristics of BigData?**
Just a little preface for you. Initially, BigData was characterised by the usage of the three V's. Volume, Velocity and Variety. However, enhancement in the technology has led the addition of two extra V's.
So, the 5 V's of BigData are as follows

####**Volume**
Volume refers to the amount of data being generated on a daily basis. Think in terms of gigabytes, terabytes and petabytes. The conventional systems are unable to store this huge volume of data, let alone process it. Around the year of 2012, the volume of data that companies deal with skyrocketed and this volume doubles about every 12 months, roughly of course.

####**Velocity**
Velocity refers to the rate at which new data is created. Data is streaming in at an unprecedented rate and must be dealt with in a timely manner in order to extract maximum value from the data. Problems would arise by not reacting quickly enough to benefit from the data. Another relevant problem is that data flows tend to be highly inconsistent with periodic peaks.

Let's try to understand this briefly. Imagine a scenario where there's a terabyte of valuable data stored in a companies server. Each megabyte of data in this pool is more valuable than the other. If there occurs to be a security breach and say 10mb data was stolen/manipulated. For a system to calculate the breach location and the lost/manipulated data, it needs to have quick response capability, else, data is gone for good.

####**Variety**
Variety refers to the varied types of data being generated from varied sources. For example, a company can obtain data from many different sources, but the importance of the sources depends upon the nature of the business. Example, A company can deal with videos, pictures and audios, and all this data must be given equal accessibility to improve efficiency.

####**Veracity**
The fourth V is veracity. Veracity refers to the quality of the data. It's important to be assured that the data being dealt with accurate and is not missing any detail. Adding to the accuracy, it is always preferred to be aware of the fact that the data being dealt with has something important to offer to the business.

####**Value**
Finally, the fifth V is value. Value refers to the ability of the system to transform this humungous amount of data into business. i.e making a 1tb folder filled with cat photos, into a $10,000 empire. It's possible. World's crazy.

---

##**Are you ready for an assessment?**

![QuizTime](https://i.giphy.com/media/CzbiCJTYOzHTW/giphy.webp)
*[Click Here To Start The Quiz](https://docs.google.com/forms/d/e/1FAIpQLScZA25zZYCTv5negBJNg7AcMYSdiAMQRG0u3_CdBL9Q28y1CQ/viewform?usp=sf_link)*

With these basic topics covered, we end this module. If you aren't clear about anything, watch my video. If that didn't help either, go through the references that I have kept here on this blog. If they also don't help, feel free to contact me. As you might already know, BigData is not a simple topic, the characterisation and definitions go beyond books, Impossible to cover it all in one blog. But, let's just get started right?

If you liked this, clap clap, it'll motivate me to keep this series going. If you have any addition or suggestion, do comment and help me and your fellow readers.

Catch you guys in the next Module!

The Next Module is out Now! 
Check it out here to continue your course!
[Module 1.2 Introduction to Hadoop](https://dev.to/theflopguy/introduction-to-hadoop-for-dummies-module1-2-21bm).

Ciao!

**References:**
- [What's BigData?](https://www.youtube.com/watch?v=eVSfJhssXUA)
- [Structured Vs Unstructured?](https://www.datamation.com/big-data/structured-vs-unstructured-data.html)
