# Open-Secure-DNS

Why DNS-Secure ? The protocol DNS is the only one to be insecure protocol.
This application is not miracle solution, But I think it's really important to create
a basic entity. 

What differences between this one and  DNS over-https

....

Open DNS Secure, will be used as a proxy DNS  ....

At this moment this application is in a version of  Alpha development.

I have realized some test of in local, and I think it possible to divide the flow of query by two, that allows decreasing the queries betwwen wan network and you... 
And then the DNS service provider can be played are role of proxy DNS.

...

### Reasons

Simply, because my country will use soon some software from NSA for make mass listening,
privacy life is threatened, it's really important to have a real control on your networking navigation.

Time to retake the control of your flow.

##Client

### Client Configuration

You should to change your name server ip from your OS 

- Linux : Configure networking `card /etc/network`
    - property : `nameserver 127.0.0.1`
    
- Windows : Fill the input with localhost ip `127.0.0.1`

## Server 

### Become domain & tld provider

DSN-Secure server work in background with Named DNS into a Linux platform. 
So each person who will be use your DNS service, will be able to access  all
domain name or tld, which will be hosted by your Named DNS server.
 In opposite case, Named will be asking are third part to resolve query.
 
<img src="https://i.ibb.co/yWGHfzY/Untitled-Diagram-Page-38.png" alt="Untitled-Diagram-Page-38" border="0">

To do :
 
Initiate good and serious list of DNS service, except google, Aws and another service DNS which privacy 
 with doesn't rime to the privacy life....

### User Enrollment 

- After registering, the user will have a 32-bit number which reflects are UID, public key and a passphrase, all these data will be delivered by this DNS service provider (free or in paid mode)
- From this provider, it will be possible to change the public key and password
- Then you can take advantage of your secure DNS, after having configuring it

### Difficulty

Today the principal difficulty for deploy a server is to find a hoster with an offer UDP .... AWS via their VM not good idea, bandwidth is really short.

## Licence Clauses

This project is under AGPL Licence, no commercial purpose can be make with it. In fact, It does not allowed to use the source code for commercial purposes as stated in the license, but it's possible to take advantage of a commercial purpose of this application when while it's running by your owns hosting. You corporation or another entity can offer a service in paid mode with this application.  