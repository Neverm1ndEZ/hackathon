# CommunityShield: A Hyperlocal Disaster Response Network

CommunityShield is a decentralized emergency response system designed to operate seamlessly even when traditional communication infrastructure fails. By leveraging mesh networking technology and offline-first capabilities, it empowers communities to share critical information, resources, and skills during disasters.

---

## Key Features

1. **Mesh Networking**: 
   - Devices communicate directly via Bluetooth and Wi-Fi Direct within a range (~100 meters).
   - Enables sharing of critical updates, resource availability, and distress signals without cellular service.

2. **Resource Mapping**:
   - Real-time crowdsourced updates about the availability of essential supplies such as water, medical resources, and shelter.
   
3. **Skills Registry**:
   - Allows community members to register their relevant skills (e.g., medical training, construction) for effective utilization during emergencies.

4. **Offline Knowledge Base**:
   - Region-specific disaster response protocols and first-aid guides are automatically downloaded and updated for offline access.

---

## Why CommunityShield?

This project focuses on building **resilient communities** through technology that works without relying on existing infrastructure. By operating in various connectivity modes, it ensures that vital information is always accessible.

---

## Modes of Operation

1. **Online Mode**:
   - Full functionality with server connectivity, including live updates and cloud synchronization.

2. **Offline-Individual Mode**:
   - Basic features like accessing the offline knowledge base and registering resources/skills without any network connectivity.

3. **Mesh Network Mode**:
   - Peer-to-peer communication between devices in close proximity using WebRTC and PeerJS.

---

## Progressive Web App (PWA)

CommunityShield is built as a Progressive Web App (PWA) to ensure seamless functionality across devices (mobile and desktop). Core offline functionalities are enabled via service workers and IndexedDB.

---

## Technology Stack

### **Frontend**
- **React.js**: Main application framework.
- **Next.js**: Server-side rendering (SSR) and static generation.
- **Tailwind CSS**: Responsive design and UI components.
- **WebRTC & PeerJS**: Peer-to-peer communication for mesh networking.
- **Service Workers**: Offline functionality.
- **IndexedDB**: Local data storage.
- **Workbox**: PWA enhancements.

### **Backend**
- **Node.js & Express**: Main server and API development.
- **MongoDB**: Database with offline replication support.
- **Socket.IO**: Real-time updates during online mode.
- **Redis**: Caching and pub/sub functionality for efficient data distribution.

---

## Architecture Overview

1. **Frontend**:
   - Handles the user interface and offline/mesh network functionality.
   - Leverages PWA features for optimal offline performance.

2. **Backend**:
   - Processes server-side logic, manages the database, and ensures real-time communication when online.

3. **Data Storage**:
   - **MongoDB**: Persistent storage for resources, skills, and user data.
   - **IndexedDB**: Local storage for offline data access.

4. **Networking**:
   - **WebRTC & PeerJS**: Enables device-to-device communication in mesh network mode.
   - **Socket.IO**: Provides live data updates in online mode.
