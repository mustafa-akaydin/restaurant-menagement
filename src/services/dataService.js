import { db } from '../config/firebase';
import { auth } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc,
  deleteDoc,
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

class DataService {
  // Örnek menü verilerini eklemek için yardımcı fonksiyon
  static async initializeMenuData() {
    const menuItems = [
      {
        name: "Margarita Pizza",
        description: "Domates sos, mozarella peyniri ve fesleğen",
        price: 120,
        category: "Pizza",
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format"
      },
      {
        name: "Spaghetti Carbonara",
        description: "Kremalı sos, parmesan peyniri ve pancetta",
        price: 95,
        category: "Makarna",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format"
      },
      {
        name: "Izgara Köfte",
        description: "Özel baharatlarla hazırlanmış dana köfte",
        price: 110,
        category: "Ana Yemek",
        image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500&auto=format"
      },
      {
        name: "Tiramisu",
        description: "İtalyan usulü kahveli tatlı",
        price: 65,
        category: "Tatlı",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format"
      },
      {
        name: "Tavuk Şiş",
        description: "Özel marine edilmiş tavuk şiş",
        price: 90,
        category: "Ana Yemek",
        image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=500&auto=format"
      },
      {
        name: "Mercimek Çorbası",
        description: "Geleneksel Türk mercimek çorbası",
        price: 35,
        category: "Çorba",
        image: "https://images.unsplash.com/photo-1547308283-f1358c5c0b8d?w=500&auto=format"
      }
    ];

    // Mevcut menü öğelerini kontrol et
    const existingMenu = await this.getMenuItems();
    if (existingMenu.length === 0) {
      // Menü boşsa örnek verileri ekle
      for (const item of menuItems) {
        await this.addMenuItem(item);
      }
      console.log('Örnek menü verileri eklendi');
    }
  }

  // Kullanıcı işlemleri
  static async getUsers() {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async addUser(user) {
    const docRef = await addDoc(collection(db, 'users'), user);
    return { id: docRef.id, ...user };
  }

  static async findUserByEmail(email) {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  }

  // Rezervasyon işlemleri
  static async getReservations() {
    try {
      const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
      return reservationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date || data.createdAt?.split('T')[0],
          time: data.time || '00:00',
          guests: parseInt(data.guests) || 0,
          status: data.status || 'pending'
        };
      });
    } catch (error) {
      console.error('Error getting reservations:', error);
      throw error;
    }
  }

  static async addReservation(reservation) {
    try {
      const reservationData = {
        ...reservation,
        guests: parseInt(reservation.guests) || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        date: reservation.date || new Date().toISOString().split('T')[0],
        time: reservation.time || '00:00'
      };

      const docRef = await addDoc(collection(db, 'reservations'), reservationData);
      return { id: docRef.id, ...reservationData };
    } catch (error) {
      console.error('Error adding reservation:', error);
      throw error;
    }
  }

  static async updateReservationStatus(id, status) {
    try {
      const reservationRef = doc(db, 'reservations', id);
      await updateDoc(reservationRef, { 
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }
  }

  // Sipariş işlemleri
  static async getOrders() {
    try {
      const ordersRef = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersRef);
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  static async addOrder(orderData) {
    try {
      // Kullanıcı bilgilerini al
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Son sipariş numarasını al
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('orderNumber', 'desc'), limit(1));
      const lastOrderQuery = await getDocs(q);
      
      let nextOrderNumber = 1;
      if (!lastOrderQuery.empty) {
        const lastOrder = lastOrderQuery.docs[0].data();
        nextOrderNumber = lastOrder.orderNumber + 1;
      }

      // Sipariş öğelerini doğrula ve zenginleştir
      const validatedItems = orderData.items.map(item => ({
        id: item.id,
        name: item.name || 'Ürün',
        price: item.price || 0,
        quantity: item.quantity || 1,
        total: (item.price || 0) * (item.quantity || 1)
      }));

      // Toplam tutarı hesapla
      const total = validatedItems.reduce((sum, item) => sum + item.total, 0);

      // Sipariş verilerini oluştur
      const order = {
        orderNumber: nextOrderNumber,
        items: validatedItems,
        total: total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        notes: orderData.notes || ''
      };

      // Kullanıcı durumuna göre müşteri bilgilerini ekle
      if (user) {
        // Giriş yapmış kullanıcı için
        order.userId = user.id;
        order.customerName = user.name;
        order.customerEmail = user.email;
        order.customerPhone = '';
      } else {
        // Misafir kullanıcı için
        order.userId = '';
        order.customerName = orderData.customerName || 'Misafir Müşteri';
        order.customerEmail = '';
        order.customerPhone = orderData.customerPhone || '';
      }
      
      const docRef = await addDoc(collection(db, 'orders'), order);
      return {
        id: docRef.id,
        ...order
      };
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId, newStatus) {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus });
  }

  static async cancelOrder(orderId) {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: 'cancelled' });
  }

  // Menü işlemleri
  static async getMenuItems() {
    const menuSnapshot = await getDocs(collection(db, 'menu'));
    return menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getMenuItemById(id) {
    const menuRef = doc(db, 'menu', id);
    const menuDoc = await getDoc(menuRef);
    if (!menuDoc.exists()) return null;
    return { id: menuDoc.id, ...menuDoc.data() };
  }

  static async addMenuItem(item) {
    const docRef = await addDoc(collection(db, 'menu'), item);
    return { id: docRef.id, ...item };
  }

  static async updateMenuItem(id, item) {
    const menuRef = doc(db, 'menu', id);
    await updateDoc(menuRef, item);
  }

  static async deleteMenuItem(id) {
    const menuRef = doc(db, 'menu', id);
    await deleteDoc(menuRef);
  }

  // Auth methods
  static async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      const userDoc = await this.findUserByEmail(email);
      if (!userDoc) {
        throw new Error('Kullanıcı bilgileri bulunamadı');
      }

      const userData = {
        id: user.uid,
        email: user.email,
        name: userDoc.name,
        role: userDoc.role
      };
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        throw new Error('E-posta veya şifre hatalı');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Şifre hatalı');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Geçersiz e-posta adresi');
      } else {
        throw new Error('Giriş yapılırken bir hata oluştu: ' + error.message);
      }
    }
  }

  static async register(userData) {
    const { email, password, name } = userData;
    
    try {
      console.log('Attempting to create user with:', email);
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase Auth user created:', user.uid);

      // Create user document in Firestore
      const newUser = {
        email,
        name,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      const userDoc = await this.addUser(newUser);
      console.log('User document created in Firestore:', userDoc.id);

      return {
        id: user.uid,
        email: user.email,
        name: newUser.name,
        role: newUser.role
      };
    } catch (error) {
      console.error('Register error:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Bu e-posta adresi zaten kullanımda');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Geçersiz e-posta adresi');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Şifre çok zayıf');
      } else {
        throw new Error('Kayıt olurken bir hata oluştu: ' + error.message);
      }
    }
  }

  static async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error('Çıkış yapılırken bir hata oluştu');
    }
  }

  static async updateUserRole(userId, newRole) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      console.log(`User ${userId} role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Kullanıcı rolü güncellenirken bir hata oluştu');
    }
  }

  // QR Menü işlemleri
  static async getRestaurantMenu(restaurantId) {
    try {
      const menuSnapshot = await getDocs(collection(db, 'restaurants', restaurantId, 'menu'));
      return menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting restaurant menu:', error);
      throw error;
    }
  }

  static async addRestaurantMenuItem(restaurantId, item) {
    try {
      const docRef = await addDoc(collection(db, 'restaurants', restaurantId, 'menu'), item);
      return { id: docRef.id, ...item };
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  }

  static async updateRestaurantMenuItem(restaurantId, itemId, item) {
    try {
      const menuRef = doc(db, 'restaurants', restaurantId, 'menu', itemId);
      await updateDoc(menuRef, item);
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  static async deleteRestaurantMenuItem(restaurantId, itemId) {
    try {
      const menuRef = doc(db, 'restaurants', restaurantId, 'menu', itemId);
      await deleteDoc(menuRef);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  // Restoran işlemleri
  static async getRestaurantInfo(restaurantId) {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurantDoc = await getDoc(restaurantRef);
      if (!restaurantDoc.exists()) return null;
      return { id: restaurantDoc.id, ...restaurantDoc.data() };
    } catch (error) {
      console.error('Error getting restaurant info:', error);
      throw error;
    }
  }

  static async createRestaurant(restaurantData) {
    try {
      const docRef = await addDoc(collection(db, 'restaurants'), {
        ...restaurantData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...restaurantData };
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  }

  static async updateRestaurant(restaurantId, restaurantData) {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await updateDoc(restaurantRef, {
        ...restaurantData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  }
}

// Export the class itself, not an instance
export default DataService; 