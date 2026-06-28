import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { CartService } from "../cart.service";

interface MenuItem {
  name: string;
  priceText: string;
  basePrice: number;
  imageUrl?: string;
}

interface MenuCategory {
  name: string;
  emoji: string;
  items: MenuItem[];
}

interface CartItemMeta {
  name: string;
  basePrice: number;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  private readonly categoryColors: { [key: string]: string } = {
    'Appetizers Veg':      'linear-gradient(135deg, #e65c00, #f9d423)',
    'Appetizers Non Veg':  'linear-gradient(135deg, #c0392b, #e67e22)',
    'Breakfast Combos':    'linear-gradient(135deg, #f39c12, #f1c40f)',
    'Snack Box':           'linear-gradient(135deg, #d35400, #f39c12)',
    'Chaat Section':       'linear-gradient(135deg, #e74c3c, #f39c12)',
    'Tiffins/Dosas':       'linear-gradient(135deg, #ca6f1e, #f0b27a)',
    'Veg Gravies':         'linear-gradient(135deg, #27ae60, #f39c12)',
    'Mandi Specials':      'linear-gradient(135deg, #a04000, #e59866)',
    'Dum Biryani':         'linear-gradient(135deg, #b7950b, #f4d03f)',
    'Non Veg Gravies':     'linear-gradient(135deg, #922b21, #e74c3c)',
    'Rice Specials':       'linear-gradient(135deg, #1a5276, #2e86c1)',
    'Hot Beverages':       'linear-gradient(135deg, #4a235a, #884ea0)',
    'Cold Beverages':      'linear-gradient(135deg, #1a5276, #85c1e9)',
  };
  categories: MenuCategory[] = [
    {
      name: 'Appetizers Veg',
      emoji: '🍽️',
      items: [
        { name: 'Cheekpeas Pepper Salt',    priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Cheekpeas Pepper Salt.jpeg' },
        { name: 'Cheek Peas Pepper Fry',    priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Cheek Peas Pepper Fry.jpeg' },
        { name: 'Gobi 65',                  priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Gobi 65.jpeg' },
        { name: 'Baby Corn Manchuria',       priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Baby Corn Manchuria.jpeg' },
        { name: 'Gobi Manchuria',            priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Gobi Manchuria.jpeg' },
        { name: 'Dragon Cauliflower',        priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Dragon Cauliflower.jpeg' },
        { name: 'Chilli Baby Corn',          priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Chilli Baby Corn.jpeg' },
        { name: 'Pepper Baby Corn Fry',      priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Pepper Baby Corn Fry.jpeg' },
        { name: 'Karam Podi Gobi',           priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Karam Podi Gobi.jpeg' },
        { name: 'Coriander Gobi',            priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Coriander Gobi.jpeg' },
        { name: 'Veg Manchuria',             priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Veg Manchuria.jpeg' },
        { name: 'Chilli Mushroom',           priceText: '$11.99', basePrice: 11.99, imageUrl: 'assets/menu-images/Chilli Mushroom.jpeg' },
        { name: 'Chilly Paneer',             priceText: '$11.99', basePrice: 11.99, imageUrl: 'assets/menu-images/Chilly Paneer.jpeg' },
        { name: 'Coriander Paneer',          priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Coriander Paneer.jpeg' },
        { name: 'Paneer Pakoda',             priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Paneer Pakoda.jpeg' },
        { name: 'Paneer Manchuria',          priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Paneer Manchuria.jpeg' },
        { name: 'Jalapeno Paneer',           priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Jalapeno Paneer.jpeg' },
        { name: 'Curry Leaf Paneer',         priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Curry Leaf Paneer.jpeg' },
        { name: 'Charmasala Fried Paneer',   priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Charmasala Fried Paneer.jpeg' },
        { name: 'Karampodi Paneer',          priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Karampodi Paneer.jpeg' }
      ]
    },
    {
      name: 'Appetizers Non Veg',
      emoji: '🍗',
      items: [
        { name: 'Chilli Egg',            priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Chilli Egg.jpeg' },
        { name: 'Chowanam Fried Chicken', priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Chowanam Fried Chicken.jpeg' }
      ]
    },
    {
      name: 'Breakfast Combos',
      emoji: '🥞',
      items: [
        { name: 'Idly + 1 Vada',        priceText: '$5.99', basePrice: 5.99, imageUrl: 'assets/menu-images/Idly + 1 Vada.jpeg' },
        { name: 'Vada + 1 Bonda',        priceText: '$7.99', basePrice: 7.99, imageUrl: 'assets/menu-images/Vada + 1 Bonda.jpeg' },
        { name: 'Idly + Upma / Pongal',  priceText: '$8.99', basePrice: 8.99, imageUrl: 'assets/menu-images/Idly + Upma : Pongal.jpeg' }
      ]
    },
    {
      name: 'Snack Box',
      emoji: '🍟',
      items: [
        { name: 'Samosa (2 Pcs)',                    priceText: '$4.99', basePrice: 4.99, imageUrl: 'assets/menu-images/Samosa (2 Pcs).jpeg' },
        { name: 'Onion Samosa (2 Pcs)',              priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Onion Samosa (2 Pcs).jpeg' },
        { name: 'Alu Samosa + Paya Vada (2 pcs)',    priceText: '$6.99', basePrice: 6.99 },
        { name: 'Onion Spinach Pakora',              priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Onion Spinach Pakora.jpeg' },
        { name: 'Mirchi Bajji (4 pcs)',              priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Mirchi Bajji (4 pcs).jpeg' },
        { name: 'Punugulu (10 pcs)',                 priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Punugulu (10 pcs).jpeg' },
        { name: 'Stuffed Mirchi (3 pcs)',            priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Stuffed Mirchi (3 pcs).jpeg' }
      ]
    },
    {
      name: 'Chaat Section',
      emoji: '🍲',
      items: [
        { name: 'Vada Pav',        priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Vada Pav.jpeg' },
        { name: 'Pani Puri (5 pcs)', priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Pani Puri (5 pcs).jpeg' }
      ]
    },
    {
      name: 'Tiffins/Dosas',
      emoji: '🫓',
      items: [
        { name: 'Idly (3 pcs)', priceText: '$7.99', basePrice: 7.99 },
        { name: 'Vada (2 pcs)', priceText: '$7.99', basePrice: 7.99 },
        { name: 'Upma', priceText: '$7.99', basePrice: 7.99 },
        { name: 'Pongal', priceText: '$7.99', basePrice: 7.99 },
        { name: 'Ghee Karam Idly (3 pcs)', priceText: '$8.99', basePrice: 8.99 },
        { name: 'Sambar Idly (2 pcs)', priceText: '$8.99', basePrice: 8.99 },
        { name: 'Sambar Vada (2 pcs)', priceText: '$8.99', basePrice: 8.99 },
        { name: 'Mysore Bonda (3 pcs)', priceText: '$8.99', basePrice: 8.99 },
        { name: 'Plain Dosa', priceText: '$8.99', basePrice: 8.99 },
        { name: 'Masala Dosa', priceText: '$10.99', basePrice: 10.99 },
        { name: 'Mysore Masala Dosa', priceText: '$10.99', basePrice: 10.99 },
        { name: 'Onion Dosa', priceText: '$10.99', basePrice: 10.99 },
        { name: 'Podi Karam Dosa', priceText: '$10.99', basePrice: 10.99 },
        { name: 'Guntur Karam Dosa', priceText: '$10.99', basePrice: 10.99 },
        { name: 'Annam Cheese Dosa', priceText: '$11.99', basePrice: 11.99 },
        { name: 'Nutella Dosa', priceText: '$11.99', basePrice: 11.99 },
        { name: 'Paneer Dosa', priceText: '$11.99', basePrice: 11.99 },
        { name: 'Ghee Karam Dosa', priceText: '$11.99', basePrice: 11.99 },
        { name: 'Gongura Onion Dosa', priceText: '$11.99', basePrice: 11.99 },
        { name: 'Egg Dosa', priceText: '$11.99', basePrice: 11.99 },
        { name: 'Chicken 65 Dosa', priceText: '$11.99', basePrice: 11.99 },
        { name: 'Chicken Keema Dosa', priceText: '$12.99', basePrice: 12.99 }
      ]
    },
    {
      name: 'Veg Gravies',
      emoji: '🍛',
      items: [
        { name: 'Yellow Dal Tadka', priceText: '$11.99', basePrice: 11.99 },
        { name: 'Mix Vegetable Curry', priceText: '$12.99', basePrice: 12.99 },
        { name: 'Kadai Veg Curry', priceText: '$12.99', basePrice: 12.99 },
        { name: 'Navratan Korma Veg', priceText: '$12.99', basePrice: 12.99 },
        { name: 'Chana Masala', priceText: '$12.99', basePrice: 12.99 },
        { name: 'Palak Chana', priceText: '$12.99', basePrice: 12.99 },
        { name: 'Aloo Gobi', priceText: '$12.99', basePrice: 12.99 },
        { name: 'Gutti Vankaya Curry', priceText: '$12.99', basePrice: 12.99 },
        { name: 'Bhindi Masala', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Malai Kofta', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Kaju Matar', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Navratan Korma', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Mushroom Masala', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Kaju Masala', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Kaju Capsicum Masala', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Achari Handi Masala', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Veg Kheema Masala', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Paneer Butter Masala', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Paneer Tikka Masala', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Palak Paneer', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Kadai Paneer', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Methi Paneer', priceText: '$14.99', basePrice: 14.99 }
      ]
    },
    {
      name: 'Mandi Specials',
      emoji: '🍗',
      items: [
        { name: 'Paneer Juicy Mandi', priceText: '$23.99 / $41.99 / $61.99', basePrice: 23.99 },
        { name: 'Veg Mandi', priceText: '$23.99 / $41.99', basePrice: 23.99 },
        { name: 'Egg Mandi', priceText: '$21.99 / $41.99', basePrice: 21.99 },
        { name: 'Chicken Fry Piece Mandi', priceText: '$21.99 / $41.99', basePrice: 21.99 },
        { name: 'Juicy Chicken Mandi', priceText: '$23.99 / $45.99 / $67.99', basePrice: 23.99 },
        { name: 'Spicy Chicken Mandi', priceText: '$23.99 / $45.99 / $67.99', basePrice: 23.99 },
        { name: 'Afghani Chicken Mandi', priceText: '$23.99 / $45.99 / $67.99', basePrice: 23.99 },
        { name: 'Ghee Roast Mutton Mandi', priceText: '$24.99 / $47.99', basePrice: 24.99 },
        { name: 'Afghani Mutton Mandi', priceText: '$24.99 / $47.99', basePrice: 24.99 },
        { name: 'Spicy Shrimp Mandi', priceText: '$24.99 / $47.99', basePrice: 24.99 }
      ]
    },
    {
      name: 'Dum Biryani',
      emoji: '🍚',
      items: [
        { name: 'Veg Biryani', priceText: '$14.99 / $29.99', basePrice: 14.99 },
        { name: 'Gongura Veg Biryani', priceText: '$15.99 / $31.99', basePrice: 15.99 },
        { name: 'Ulavacharu Biryani', priceText: '$16.99 / $33.99', basePrice: 16.99 },
        { name: 'Chicken Dum Biryani', priceText: '$15.99 / $29.99', basePrice: 15.99 },
        { name: 'Gongura Chicken Dum', priceText: '$16.99 / $31.99', basePrice: 16.99 },
        { name: 'Ulavacharu Chicken Dum', priceText: '$16.99 / $33.99', basePrice: 16.99 },
        { name: 'Avakai Dum', priceText: '$16.99 / $33.99', basePrice: 16.99 },
        { name: 'Goat Dum', priceText: '$17.99 / $33.99', basePrice: 17.99 },
        { name: 'Gongura Goat Dum', priceText: '$18.99 / $39.99', basePrice: 18.99 }
      ]
    },
    {
      name: 'Non Veg Gravies',
      emoji: '🍗',
      items: [
        { name: 'Egg Masala', priceText: '$12.99', basePrice: 12.99 },
        { name: 'Egg Burji Dhaba Style', priceText: '$12.99', basePrice: 12.99 },
        { name: 'Butter Chicken', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Chicken Tikka Masala', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Chowrasta Special Chicken', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Andhra Chicken Curry', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Dhaba Style Chicken', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Malai Methi Chicken', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Chicken Vindaloo', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Chettinad Chicken Curry', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Palak Chicken Curry', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Kadai Chicken', priceText: '$13.99', basePrice: 13.99 },
        { name: 'Mughlai Chicken Curry', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Gongura Chicken Curry', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Kadhai Chicken', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Achari Chicken', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Chicken Kheema Curry', priceText: '$14.99', basePrice: 14.99 },
        { name: 'Chowrasta Special Goat', priceText: '$15.99', basePrice: 15.99 },
        { name: 'Andhra Goat', priceText: '$15.99', basePrice: 15.99 },
        { name: 'Dhaba Style Goat', priceText: '$15.99', basePrice: 15.99 },
        { name: 'Goat Vindaloo', priceText: '$15.99', basePrice: 15.99 },
        { name: 'Chettinad Goat Curry', priceText: '$15.99', basePrice: 15.99 },
        { name: 'Palak Goat Curry', priceText: '$15.99', basePrice: 15.99 }
      ]
    },
    {
      name: 'Rice Specials',
      emoji: '🍛',
      items: [
        { name: 'Jeera Rice', priceText: '$11.99', basePrice: 11.99 },
        { name: 'Curd Rice', priceText: '$11.99', basePrice: 11.99 },
        { name: 'Sambar Rice', priceText: '$11.99', basePrice: 11.99 },
        { name: 'Pulav Rice', priceText: '$10.99', basePrice: 10.99 }
      ]
    },
    {
      name: 'Hot Beverages',
      emoji: '☕',
      items: [
        { name: 'Irani Chai Large', priceText: '$2.99', basePrice: 2.99 },
        { name: 'Irani Chai Small', priceText: '$1.50', basePrice: 1.50 },
        { name: 'Masala Chai', priceText: '$2.00', basePrice: 2.00 }
      ]
    },
    {
      name: 'Cold Beverages',
      emoji: '🧊',
      items: [
        { name: 'Mango Lassi', priceText: '$5.99', basePrice: 5.99 },
        { name: 'Milk Shakes (Choco/Strawberry Mix)', priceText: '$6.99', basePrice: 6.99 },
        { name: 'Fresh Fruit Juice (Orange/Pineapple/Muskmelon)', priceText: '$6.99', basePrice: 6.99 },
        { name: 'Oreo Shake', priceText: '$7.99', basePrice: 7.99 },
        { name: 'Chocolate Shake', priceText: '$7.99', basePrice: 7.99 },
        { name: 'Sugar Cane Juice', priceText: '$7.99', basePrice: 7.99 }
      ]
    }
  ];

  selectedCategory: MenuCategory = null;
  pendingMap: { [key: string]: number } = {};
  cartMap: { [key: string]: number } = {};
  cartMetaMap: { [key: string]: CartItemMeta } = {};
  cartCount = 0;
  total = 0;

  constructor(private router: Router, private cartService: CartService) {}

  ngOnInit() {
    if (sessionStorage.getItem('userData') == null) {
      this.router.navigate(['login']);
      return;
    }

    this.deduplicateCategoryItems();

    const storedCart = sessionStorage.getItem('fdCartMap');
    if (storedCart) {
      try {
        this.cartMap = JSON.parse(storedCart);
      } catch {
        this.cartMap = {};
      }
    }

    const storedTotal = sessionStorage.getItem('total');
    this.total = storedTotal ? parseFloat(storedTotal) || 0 : 0;

    const storedMeta = sessionStorage.getItem('fdCartMetaMap');
    if (storedMeta) {
      try {
        this.cartMetaMap = JSON.parse(storedMeta);
      } catch {
        this.cartMetaMap = {};
      }
    }

    this.refreshCartCount();
  }

  private deduplicateCategoryItems(): void {
    this.categories = this.categories.map((category) => {
      const seen = new Set<string>();
      const uniqueItems = category.items.filter((item) => {
        const key = item.name.trim().toLowerCase();
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
      return {
        ...category,
        items: uniqueItems
      };
    });
  }

  selectCategory(category: MenuCategory): void {
    this.selectedCategory = category;
  }

  backToCategories(): void {
    this.selectedCategory = null;
  }

  increaseItem(item: MenuItem, itemIndex: number): void {
    const key = this.getItemKey(item, itemIndex);
    this.pendingMap[key] = (this.pendingMap[key] || 0) + 1;
  }

  decreaseItem(item: MenuItem, itemIndex: number): void {
    const key = this.getItemKey(item, itemIndex);
    const current = this.pendingMap[key] || 0;
    if (current <= 0) {
      return;
    }
    const next = current - 1;
    if (next === 0) {
      delete this.pendingMap[key];
    } else {
      this.pendingMap[key] = next;
    }
  }

  getItemQuantity(item: MenuItem, itemIndex: number): number {
    const key = this.getItemKey(item, itemIndex);
    return this.pendingMap[key] || 0;
  }

  addToCart(item: MenuItem, itemIndex: number): void {
    const key = this.getItemKey(item, itemIndex);
    const qtyToAdd = this.pendingMap[key] || 0;
    if (qtyToAdd <= 0) {
      return;
    }

    this.cartMap[key] = (this.cartMap[key] || 0) + qtyToAdd;
    this.cartMetaMap[key] = { name: item.name, basePrice: item.basePrice };
    this.total = +(this.total + (item.basePrice * qtyToAdd)).toFixed(2);
    delete this.pendingMap[key];
    this.persistCart();
    this.refreshCartCount();
  }

  clearLocal(): void {
    this.cartService.clearCart();
    sessionStorage.removeItem('fdCartMap');
    sessionStorage.removeItem('fdCartMetaMap');
    sessionStorage.clear();
  }

  private refreshCartCount(): void {
    this.cartCount = Object.keys(this.cartMap).reduce((sum, key) => sum + (this.cartMap[key] || 0), 0);
    this.cartService.updateCount(this.cartCount);
  }

  private persistCart(): void {
    sessionStorage.setItem('fdCartMap', JSON.stringify(this.cartMap));
    sessionStorage.setItem('fdCartMetaMap', JSON.stringify(this.cartMetaMap));
    sessionStorage.setItem('total', this.total.toFixed(2));
  }

  private getItemKey(item: MenuItem, itemIndex: number): string {
    const categoryName = this.selectedCategory ? this.selectedCategory.name : 'uncategorized';
    return `${categoryName}::${itemIndex}::${item.name}`;
  }

  getCategoryColor(categoryName?: string): string {
    return (categoryName && this.categoryColors[categoryName])
      ? this.categoryColors[categoryName]
      : 'linear-gradient(135deg, #e65c00, #f9d423)';
  }

  onItemImageError(event: Event, item: MenuItem): void {
    const element = event.target as HTMLImageElement | null;
    if (element) {
      element.style.display = 'none';
      item.imageUrl = null;
    }
  }
}

/* Keep legacy exports to avoid breaking other components that import from this file. */
export interface menu {
  id: string;
  item: string;
  price: number;
  quantity: number;
  url: string;
  formID: string;
  cartID: string;
}

export interface cart {
  quantity1: number;
  quantity2: number;
  quantity3: number;
}

export class Quantity {
  quantity: number;
}
