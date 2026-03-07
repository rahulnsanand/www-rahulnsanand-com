---
title: "Introduction to Hadoop for dummies [Module1.2]"
description: "Ever wondered why Hadoop is such a big deal? Why does almost every bigdata concept begin and end with..."
date: "2020-06-09"
tags:
  - bigdata
  - beginners
  - datascience
  - welcome
coverImage: "/blog-covers/hadoop-module-1-2-cover.webp"
devtoUrl: "https://dev.to/rahulnsanand/introduction-to-hadoop-for-dummies-module1-2-21bm"
mediumUrl: "https://medium.com/@rahulnsanand/introduction-to-hadoop-for-dummies-module-1-2-cdb782a776cd"
---
Ever wondered why Hadoop is such a big deal? Why does almost every bigdata concept begin and end with Hadoop? Is it really necessary to know the concept of Hadoop to be able to get into the stream of BigData? Let’s find out!

Hey pals, welcome to Module 1.2. If you are new here, check out [Module 1.1 for Introduction of BigData](https://dev.to/theflopguy/introduction-to-bigdata-for-dummies-module-1-1-31o6).

Here, we are going to learn about Hadoop and why we need to understand the basic concepts of Hadoop and its ecosystem. We will also learn why it’s used and how it's used. Understanding these concepts is crucial for you to be able to understand the truth behind the functionality of how Hadoop does its thing when we get to a practical approach in Module 2.x series.

![LetsStart](https://miro.medium.com/max/800/1*OK2Tutml3_G7JYYtsCwsBw.gif)

---

###**What is Hadoop?**
Hadoop is an open-source software framework for distributed storing and processing large sets of data on commodity hardware.

Made a note to memorize? Great. Now let’s dig into this, one term at a time so you can learn.

####**What is distributed storing and processing?**
Hadoop uses this concept called “distributed storage and processing”. Large datasets are split into smaller chunks, called blocks, and distributed across the cluster machines and each of these blocks gets processed in a distributed way across, sometimes, hundreds of CPUs.

As always, the example coming up.
Imagine you have a 10gb video you want to download from the internet. You have a 10mbps download rate. After some rough math, you will take right about 16 minutes to download that file.

Now imagine the same scenario, where the file is split into 5 parts. Each worth (10/5)GB or, 2GB per part. And you are downloading 2GB per CPU and you have 5 CPUs to download the 5 parts. Each CPU has 10mbps speed.

![SplitFile](https://miro.medium.com/max/1400/1*m6Ch9UOrxOY1oG-xW1ZbKA.jpeg)

Now, per CPU, the total time taken is approximately 8 minutes. Now since all these computers are running the download parallelly, you have downloaded the same 10GB file, in 5 parts, within 8 minutes. That’s half the time it would’ve taken otherwise.

Sure 8 minutes is not worth so much work. But, imagine a terabyte worth data. Or a Petabyte worth. This huge amount of data will take days to process, but halving the amount of time in that scale will be very significant. Don’t you think?

That’s exactly what Hadoop does. Well, it doesn’t really download things faster, but, it processes things faster using a distributed setup.

####**But wait, what’s a cluster?**
Well, A cluster basically is that setup of 5 CPUs that you had in the previous example, collectively, they’re a cluster, each of which is commonly referred to as nodes, working on the same datasets in a distributed manner. Don’t worry if you don’t get it perfectly, you will eventually.

---

Hadoop has some basic characteristics that give it the importance that it deserves, some of these are:

###**Scalability**
In order to improve the efficiency of the cluster to handle more data, more and more nodes can be added to the cluster whenever required. A Hadoop cluster can range from one machine to thousands of machines.

###**Fault Tolerance**
![SplitFile](https://miro.medium.com/max/1400/1*ziXuT4GLZtIXiUds--hd_A.jpeg)

Fault Tolerance is a scenario where, those 5 parts of one file that we received are stored in 5 different CPUs, and the fifth CPU dies a sad death. In that case, we would lose our 5th Part. To prevent this, fault tolerance in Hadoop is achieved through redundancy. A block of data stored in one node gets replicated in other nodes in order to avoid loss of any data in case of failure of a node. Sounds like too much work, I know. But, problem solved.

###**Flexibility**
Unlike conventional systems, Hadoop provides the flexibility of storing and processing data from different sources. You can store as much data as you want and use it later as required. This assures flexibility of Hadoop in terms of what kind of data it is capable of processing.

---

###**What are the components of this Hadoop Framework?**

![SelfFive](https://miro.medium.com/max/960/1*pUuqqiAL0faL5VslyzfUBQ.gif)
*Brilliant question (Self Five!)*

####**HDFS**
HDFS refers to the Hadoop Distributed File System. It is the primary data storage system solution used by Hadoop. There are basically two types of nodes: Master node and Worker nodes. There is one master node per cluster while multiple worker nodes are present in a cluster. NameNode is the master node of HDFS while DataNode is the worker node of HDFS.

In HDFS, NameNode (Master Node) does not store data but maintains the information of all the DataNodes (Worker Nodes), file and directory structure, permissions and ownership and metadata information of the cluster. While DataNode is responsible for storing the data in the form of blocks. Only NameNode has information about which data block is stored in which DataNode. Data blocks are so critical that DataNode automatically replicates them across multiple DataNodes (As we have already discussed in? Right, Fault Tolerance).

####**YARN**
YARN refers to Yet Another Resource Negotiator (They try to be cool; I give them that). It was introduced in the second generation of Hadoop, i.e., Hadoop 2.x.

Now, Resource Management is a core component of YARN. It comprises of three components: ResourceManager, ApplicationMaster and NodeManager.

#####**ResourceManager**
It’s the master node and is responsible for allocating resources and scheduling applications.

Scheduling here means, let’s say your process needs 1GB RAM and 2 Cores of CPU processing. It is the responsibility of YARN scheduler to take care of this requirement by basically assigning the required provision to our process. This is done in 3 ways, let’s go through them briefly.

- FIFO Scheduler: First in first out, A queue setup is made of required specifications per process and the process is performed according to that. However, FIFO is not suited for shared clusters as large applications will occupy all resources and queues will get longer due to lower serving rate.
- Capacity Scheduler: This maintains a separate queue for small jobs in order to start them as soon a request is initiated. However, this comes at a cost as we are dividing the cluster capacity hence large jobs will take more time to complete.
- Fair Scheduler: This scheduler does not have any requirement to reserve capacity. It dynamically balances the resources into all accepted jobs. When a job starts — if it is the only job running — it gets all the resources of the cluster. When the second job starts it gets the resources as soon as some containers, (a container is a fixed amount of RAM and CPU) get free. After the small job finishes, the scheduler assigns resources to a large one.

#####**NodeManager**
It’s the worker node of YARN and is responsible for executing applications. These two are the daemon processes of YARN while ApplicationMaster is an application process.

#####**First off, What’s a Daemon Process?** (I, for one, find the word Daemon pretty funny)
Daemon is referred to something that processes in the background in your system. It can be an application or a process.

So, here, Daemon processes NodeManager, and ResourceManager is those processes of YARN that run in the background and facilitate our system with Hadoop capabilities. We’ll take a much deeper look at it once we get into practical.

#####**Now, what’s an ApplicationMaster?**
Well, it is a process that is created at the launch of every application and is active until the application is running. It holds the application status.

---

![UummmOK](https://miro.medium.com/max/920/1*ntZcE7jjbBAXWKAeqT8xQQ.gif)
*Ever heard of MapReduce? What the hell is that?*

MapReduce is a software framework for processing large amount of data that is stored in HDFS. It consists of three phases:

###**MAP**
In this phase, the input is taken from HDFS in the form of files and directories. The input file is passed to the mapper function line by line. This mapper processes the data and converts the data in key-value pair format. The output from this phase goes to reducer for getting processed.

####**What is a key-value pair?**
Well. It’s just a way a mapper works. Now a mapper is a function that processes data. It breaks down large amounts of data in smaller blocks that are well, key-value pairs. A Mapper is a function of the Map Phase of a MapReduce job.

Phew, now that that’s out of the way. Let’s dig into this key-value pair using the most common example that there is. WordCount. Hallelujah!

Imagine there is a file with the following text stored in it.

**The innocent dog jumped over the wall. Ran towards his bone and hid it under the ground.**

The first task of a MapReduce job is to break this file down into multiple blocks and store them each in DataNodes across the cluster. I mean, isn’t that how we learnt to reduce our workload? By splitting it and spreading it across multiple computers?

Great, now we must note that there is one mapper assigned for each block of data in a DataNode. There can also be multiple blocks of data in a single DataNode depending on the requirement and the capability of that DataNodes CPU. So, we have multiple mappers.

![DataNodeSplit](https://miro.medium.com/max/1400/1*I5W1bJK3bmqeZQNEXv0FHw.jpeg)

Let’s take this image into consideration. We have 2 DataNodes, each DataNode has its respective block of data and each block of data is assigned a mapper function to process that data.

![MapReduce](https://miro.medium.com/max/1400/1*_zducuJrrZ43l7z_KJ-VKA.jpeg)
*The whole deal*

Now each mapper will split that data into words and store them in pairs, note that it does not aggregate anything. It just takes a word, assigns it to the number of times the word is repeated within the block of data irrespective of other blocks.

So, we have now created the following set of key-value pairs in the first DataNode.

**The, 2**
**Innocent, 1**
**Dog, 1**
**Jumped, 1**
**Over, 1**
**Wall, 1**

And so on for every word in the second DataNode. I’m lazy to type. Now, these are what we call key-value pairs.

####But how did mapper do that?
Well, it wasn’t alone. Mapper has two concepts, really, that help in the generation of these key-value pairs. They go by the name **InputSplit** and **RecordReader**.

Now, without getting into details,
**InputSplit** basically is a logical representation of a block of data in a DataNode.

**RecordReader**, on the other hand, is solely responsible for conversion of the data into key-value pairs. Great, now let’s move ahead

###**REDUCE**
A reducer is responsible to aggregate the key-value pairs into the required output. This Reducer Phase is further split into 3 phases

####**Shuffle phase**
This phase acts as the mediator between the Map phase and the Reducer phase. In this phase, without much complication, we basically extract the output of the Mapper Phase in key-value pairs from all the DataNodes with help of HTTP. We accumulate all these pairs and send them forward to the Sort Phase

####**Sort Phase**
In this phase, we basically take the Shuffle Phase output as input and now sort all those key-value pairs according to their similar “key”. So all the similar keys stay together.

Map phase generates n number of key-value pairs and it is the responsibility of shuffle/sort phase to make sure that the value with the same key goes to the same Reducer.

#####*But there are 2 Mappers in our case, do we need 2 Reducers to process the pairs they generated?*

Well, Nah, we don’t have to decide how many reducers we need, we can. But the Hadoop framework is capable enough to decide this on its own based on the resources available.

![Wow](https://miro.medium.com/max/960/1*uzM_XcyvKR_Y5yEnHFlP5Q.gif)
*No, no, just hold on, it gets more fun!*

####**Reduce phase**
So we are in the final phase of the MapReduce Job. Reducer Phase. For this example, let’s assume our MapReduce job has decided to run 2 Reducers to complete our processing.

Reducers tasks are basically to aggregate all the keys values. Like shown in the diagram, pretty straightforward eh?

But just so you know, you can also set the number of Reducers to 0 and that will make all the output from the Mapper function to get stored in your filesystem as pairs directly.

![AreWeDone](https://miro.medium.com/max/960/1*bvXzvRHFE5duVccWoRnShA.gif)
*What after the Reducer Phase? Is MapReduce done?*

Well, not really, I mean. MapReduce Job can be considered done, but Hadoop isn’t done processing the file yet. I mean, how can you read this output if it isn’t stored in a readable file format like a text file or a CSV file?

Which brings us to another function called a **Partitioner**.

---

**Partitioner** is basically used by the Hadoop to create a partition of the keys in the key-value pairs that was the output of the final MapReduce Job. So, let’s say you have all the key-value pairs needed from the MapReduce job, Partitioner will take all these values and create a partition based on the number of Reduce jobs that your MapReduce job created. In our case, we had 2 Reduce jobs, so for us, we will have 2 Partitions. Which means, our output will be stored in 2 different files. Well, that’s no good. Imagine having to read two files to complete one sentence, that’s tedious. How do we solve that? Well, there is a simple function called a coalesce function that we can use to reduce the number of partitions we want, explicitly. So, we can just set it to 1 and, voila. We are good to go.

We have successfully counted the number of words in our text file and have understood the entire process of a MapReduce Job. Perfecto!

---

Now, let’s talk briefly about the Hadoop Ecosystem, hopefully, I haven’t lost any of you to boredom yet.

We have Hive: It is another technology of BigData which is a part of the Hadoop ecosystem and is used for query analysis on large sets of data. Uses a SQL like language called HiveQL (Very creative).

**WebHDFS**: A REST API to access, operate and manage HDFS online. (We won’t cover much about this yet, comment if you want me to)

**Spark**: A general-purpose processing engine used to run sophisticated SQL, streaming, machine learning applications. It uses in-memory data processing. All sounds very cool, right? Sure, it is. It can handle a Java-like language called Scala, and a Python-like language called PySpark.

**HBase**: A distributed NoSQL database that supports structured data storage for large tables. (Again, won’t be covering this in this course, comment if you want me to)

**Pig**: A platform for extracting, transforming and analyzing large datasets. (Not in course, comment if you want me to)

**Flume**: Used for capturing streaming data in Hadoop. For example, data from social networking sites such as Twitter, Facebook, etc. We could gather all the tweets that have the word “Jason Statham” in it. Pretty cool right? Not covered in this course though, let me know if I should

**Sqoop**: A set of tools for exporting and importing data between Hadoop and RDBMS. Pretty straightforward.

And with that, we have a basic perfect introduction to Hadoop in the whole.

---

Let’s see how much you guys remember and how well I have taught.
Take this minor assessment to learn it all!

![QuizTime](https://miro.medium.com/max/1000/1*ov_xCwDdkPNLz7Yfxhtyxg.gif)
*[Click Here To Start The Quiz](https://docs.google.com/forms/d/e/1FAIpQLSfnh2en_O_YwOVT--rO4CvMfJQnUO4cJbGUJk9MoejyK4R4OA/viewform?usp=sf_link)*

I want to take time out to say I am delighted by your response to my Module 1.1 blog, I hope I am helping out you guys in a minor way at least in getting started with this awesome technology of BigData. Leave a reaction, clap, like, share, comment. Just spread the love and I’ll see you guys in the next Module.

Ciao!

**References:**
- [Apache Official Hadoop documentation](https://hadoop.apache.org/docs/r1.2.1/mapred_tutorial.html)
- [Coalesce Explained!](https://www.quora.com/What-is-the-role-of-coalesce-and-repartition-in-Map-Reduce#:~:text=coalesce%20uses%20existing%20partitions%20to,in%20roughly%20equal%20sized%20partitions.)
- [MapReduce In More Detail](https://data-flair.training/blogs/hadoop-mapper-in-mapreduce/)
