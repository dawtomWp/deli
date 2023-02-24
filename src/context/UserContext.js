import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { magentoAddToCart } from "../graphql/magentoAddToCart";
import { magentoAddToWishlist } from "../graphql/magentoAddToWishlist";
import { magentoCategories } from "../graphql/magentoCategories";
import { magentoChangeUserPassword } from "../graphql/magentoChangeUserPassword";
import { magentoCreateCustomerAddress } from "../graphql/magentoCreateCustomerAddress";
import { magentoDeleteAddress } from "../graphql/magentoDeleteAddress";
import { magentoEditCustomerAddress } from "../graphql/magentoEditUserAddress";
import { magentoGetCart } from "../graphql/magentoGetCart";
import { magentoLogin } from "../graphql/magentoLogin";
import { magentoRemoveFromCart } from "../graphql/magentoRemoveFromCart";
import { magentoRemoveFromWishlist } from "../graphql/magentoRemoveFromWishlist";
import { magentoSetDefaultShipping } from "../graphql/magentoSetDefaultShipping";
import { magentoUpdateCartQuantity } from "../graphql/magentoUpdateCartQuantity";
import { magentoUpdateUser } from "../graphql/magentoUpdateUser";
import { magentoUserToken } from "../graphql/magentoUserToken";
import { ModalContext } from "./ModalContext";

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const location = useRouter();
  const [wishlist, setWishlist] = useState();
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState();
  const [orders, setOrders] = useState();
  const [categories,setCategories] = useState([]);
  const router = useRouter();

  useEffect(()=>{
       magentoCategories().then(res=>setCategories(res.category.children))
  },[])

  useEffect(() => {
    const isBlockedPage =
      // (router.pathname.includes("/podsumowanie") && !isLogged) ||
      router.pathname.includes("/konto") && !isLogged;

    if (isBlockedPage) {
      //router.push("/");
    }
  }, [isLogged, router]);

  const { showModal } = useContext(ModalContext);

  useEffect(() => {
    const email = localStorage.getItem("Email");
    const pass = localStorage.getItem("Password");
    if (email && pass) {
      userLogin({ email: email, password: pass });
    } else {
      console.log("nie mogę zalogować");
    }
  }, []);

  useEffect(() => {
    setWishlist(currentUser?.wishlist);
  }, [currentUser]);

  useEffect(() => {
    setAddresses(currentUser?.addresses);
  }, [currentUser]);

  useEffect(() => {
    setOrders(currentUser?.orders);
  }, [currentUser]);

  const userLogout = () => {
    setIsLogged(false);
    localStorage.removeItem("Email");
    localStorage.removeItem("Password");
    setCurrentUser({});
    setCart();
    location.push("/");
    showModal("Pomyślnie wylogowano");
  };

  const updateUserInfo = (user) => {
    magentoUpdateUser(user).then(({ response }) =>
      setCurrentUser({
        addresses,
        wishlist,
        ...response.data.updateCustomer.customer,
      })
    );
    showModal("Zaktualizowano dane");
  };
  const changeUserPassword = (passwords) => {
    magentoChangeUserPassword(passwords).then(({ response }) => {
      if (response.errors) {
        showModal("Podano błędne stare hasło");
      } else {
        showModal("Twoje hasło zostało zmienione");
      }
    });
  };

  const userLogin = async (data) => {
    try {
      const getToken = await magentoUserToken(data.email, data.password);
      localStorage.setItem("Bearer", getToken.generateCustomerToken.token);
      localStorage.setItem("Email", data.email);
      localStorage.setItem("Password", data.password);
      await magentoLogin().then(({ response }) => {
        setCurrentUser(response.data.customer);
        setAddresses(response.data.customer.addresses);
        showModal("Pomyślnie zalogowano");
      });

      await magentoGetCart().then(({ response }) =>
        setCart(response.data.customerCart)
      );

      setIsLogged(true);
    //  location.push("/konto/moje-konto");
    } catch (error) {
      // Tymczasowe sprawdzenie lokalizacji bo wchodziły dwa modale, z kontekstu i auth w momencie rejestracji
      location.pathname === "/" &&
        showModal("Niepoprawne hasło lub adres email", true);
    }
  };

  const editAddress = (address) => {
    magentoEditCustomerAddress(address).then((res) => {
      setAddresses((prev) => [
        ...prev.filter(
          (ad) =>
            ad.default_billing !==
              res.response.data.updateCustomerAddress.default_billing ||
            ad.default_shipping == ad.default_billing
        ),
        res.response.data.updateCustomerAddress,
      ]);
    });
    showModal("Zaktualizowano adres");
  };

  const editAdditionalAddress = (address) => {
    magentoEditCustomerAddress(address).then(({ response }) => {
      setAddresses((prev) => [
        ...prev.filter(
          (ad) =>
            (ad.default_shipping == ad.default_billing &&
              ad.id !== response.data.updateCustomerAddress.id) ||
            ad.default_shipping !== ad.default_billing
        ),
        response.data.updateCustomerAddress,
      ]);
    });
    showModal("Zaktualizowano adres");
  };

  const createAddress = (address) => {
    magentoCreateCustomerAddress(address).then(({ response }) => {
      setAddresses((prev) => [...prev, response.data.createCustomerAddress]);
    });
    showModal("Dodano nowy adres");
  };

  const deleteAddress = (id) => {
    magentoDeleteAddress(id).then(({ response }) => {
      setAddresses((prev) => [...prev.filter((address) => address.id !== id)]);
    });
    showModal("Usunięto adres");
  };

  const changeDefaultShippingAddress = (id) => {
    magentoSetDefaultShipping(id).then(({ response }) => {
      const previous = addresses.filter((ad) => ad.default_shipping === true);
      previous[0].default_shipping = false;
      setAddresses((prev) => [
        ...prev.filter(
          (ad) =>
            (ad.default_shipping == ad.default_billing &&
              ad.id !== response.data.updateCustomerAddress.id) ||
            ad.default_shipping !== ad.default_billing
        ),
        response.data.updateCustomerAddress,
      ]);
    });

    showModal("Zmieniono domyślny adres dostawy");
  };

  const addToWishlist = (sku) => {
    magentoAddToWishlist(sku).then((res) => {
      setWishlist(res.addProductsToWishlist.wishlist);
    });
    showModal("Dodano do ulubionych");
  };

  const removeFromWishlist = (id) => {
    // do dopracowania, może być sytuacja ze id produktu wishlisty pokryje się z id produktu w sklepie!
    const productStatus =
      wishlist &&
      wishlist?.items.find((item) => item.id === id || item.product.id === id);
    magentoRemoveFromWishlist(productStatus?.id, wishlist?.id).then((res) => {
      setWishlist(res.removeProductsFromWishlist.wishlist);
    });
    showModal("Usunięto z ulubionych");
  };

  const addToCart = (sku, quantity) => {
    if (currentUser) {
      magentoAddToCart(cart.id, sku, quantity).then(({ response }) =>
        setCart(response.data.addProductsToCart.cart)
      );
      showModal("Dodano do koszyka");
    } else {
      showModal("Zaloguj się aby dodać do koszyka");
    }
  };

  const removeFromCart = (id) => {
    magentoRemoveFromCart(cart.id, id).then(({ response }) =>
      setCart(response.data.removeItemFromCart.cart)
    );
    showModal("Usunięto z koszyka");
  };
  const updateCartQuantity = (uid, quantity) => {
    magentoUpdateCartQuantity(cart.id, uid, quantity).then(({ response }) => {
      // sprawdzenie czy jest w magazynie - do dopracowania
     try {
      setCart(response.data.updateCartItems.cart);
      showModal("Zaktualizowano koszyk");
     } catch(e) {
      showModal("Niewystarczająca ilość w magazynie")
     }
    }
    );
   
  };

  const removeCart = () => setCart();

  const user = {
    token,
    isLogged,
    currentUser,
    wishlist,
    addresses,
    cart,
    orders,
    categories,
    userLogin,
    removeCart,
    userLogout,
    setCurrentUser,
    removeFromWishlist,
    addToWishlist,
    editAddress,
    setAddresses,
    createAddress,
    deleteAddress,
    changeDefaultShippingAddress,
    editAdditionalAddress,
    updateUserInfo,
    changeUserPassword,
    addToCart,
    removeFromCart,
    updateCartQuantity,
  };

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
