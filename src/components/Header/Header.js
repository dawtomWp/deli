import logo from "../../../public/logo.png";
import Image from "next/dist/client/image";
import * as Styled from "./styles";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { FaRegUserCircle } from "react-icons/fa";
import { BsCartCheck } from "react-icons/bs";
import { mainMenu } from "../../fakeData/fakeData";
import { BiGitCompare, BiCalendar } from "react-icons/bi";
import { BsSuitHeart } from "react-icons/bs";
import { AiOutlineMail } from "react-icons/ai";
import { ErrorMsg } from "../ErrorMsg";
import { FaUserCircle } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { AiOutlineHeart } from "react-icons/ai";
import SearchInput from "../SearchInput";

export const Header = () => {
  const { isLogged, userLogin, currentUser, userLogout, cart, wishlist,categories } =
    useContext(UserContext);
  const [authPanelVisible, setAuthPanelVisible] = useState(false);
  const [userForm, setUserForm] = useState({});
  const [errors, setErrors] = useState([]);
  
  // console.log(categories)

  const handleLogin = (e) => {
    e.preventDefault();
    const validationPass = validation(userForm);
    if (validationPass.status) {
      setErrors({});
      userLogin(userForm);
    }
    setErrors(validationPass.errors);
  };

  const validation = (data) => {
    const errors = {};
    if (data.email == "") errors.email = "To pole jest wymagane";
    if (data.password == "") errors.password = "To pole jest wymagane";

    if (!errors.email && !errors.password)
      return {
        status: true,
        errors: null,
      };
    return {
      status: false,
      errors,
    };
  };

  const handleChange = (e) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAccountClick = () => setAuthPanelVisible((prev) => !prev);

  return (
    <Styled.Wrapper>
      <Styled.InnerWrapper>
        <Styled.Logo>
          <Link href="/">
            <a>
              <Image src={logo} alt="" />
            </a>
          </Link>
        </Styled.Logo>

        <SearchInput/>

        <Styled.IconsBar>
          {isLogged ? (
            <>
              <button onClick={handleAccountClick}>
                <FaRegUserCircle />
              </button>
              {authPanelVisible ? (
                <Styled.AuthPanel>
                  <FaUserCircle />
                  <p>Cześć {currentUser?.firstname}!</p>

                  <button aria-label="Wyloguj się" onClick={() => userLogout()}>
                    Wyloguj się
                  </button>

                  <ul>
                    <li>
                      <Link href="/konto/moje-konto">
                        <a>
                          <BiGitCompare /> MOJE KONTO
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/konto/lista-zyczen">
                        <a>
                          <BsSuitHeart /> MOJA LISTA ŻYCZEŃ
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/konto/moje-zamowienia">
                        <a>
                          <BiCalendar /> MOJE ZAMÓWIENIA
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="/konto/adresy">
                        <a>
                          <AiOutlineMail /> MOJE ADRESY
                        </a>
                      </Link>
                    </li>
                  </ul>
                </Styled.AuthPanel>
              ) : null}
            </>
          ) : (
            <>
              <button onClick={handleAccountClick}>
                <FaRegUserCircle />
              </button>
              {authPanelVisible ? (
                <Styled.AuthPanel>
                  <form onSubmit={handleLogin}>
                    <input
                      onChange={handleChange}
                      value={userForm.email}
                      type="text"
                      placeholder="Email"
                      name="email"
                    />
                    {errors && <ErrorMsg>{errors.email}</ErrorMsg>}
                    <input
                      onChange={handleChange}
                      value={userForm.password}
                      type="password"
                      placeholder="Password"
                      name="password"
                    />
                    {errors && <ErrorMsg>{errors.password}</ErrorMsg>}
                    <button aria-label="Zaloguj się" type="submit">
                      Zaloguj się
                    </button>
                  </form>
                  <button aria-label="Przypomnij hasło">
                    Nie pamiętasz hasła?
                  </button>
                  <div>
                    <p>
                      NIE MASZ KONTA?{" "}
                      <Link href="/autoryzacja">ZAREJESTRUJ SIĘ</Link>
                    </p>
                  </div>
                  <ul>
                    <li>
                      <Link href="/konto/moje-konto">
                        <a>
                          <AiOutlineMail /> SKONTAKTUJ SIĘ Z NAMI
                        </a>
                      </Link>
                    </li>
                  </ul>
                </Styled.AuthPanel>
              ) : null}
            </>
          )}

          <Link href="/koszyk">
            <Styled.CartIcon>
              <BsCartCheck />
              {cart?.items?.length ? (
                <>
                  <Styled.CartItemsNum>{cart.items.length}</Styled.CartItemsNum>
                  {/* <Styled.CartItemsValue>{cart.prices.grand_total.value}zł</Styled.CartItemsValue> */}
                </>
              ) : null}
            </Styled.CartIcon>
          </Link>
          {isLogged ? (
            <Link href="/konto/lista-zyczen">
              <Styled.CartIcon>
                <AiOutlineHeart />
                {wishlist?.items?.length ? (
                  <Styled.CartItemsNum>
                    {wishlist.items.length}
                  </Styled.CartItemsNum>
                ) : null}
              </Styled.CartIcon>
            </Link>
          ) : (
            <Link href="/autoryzacja">
              <AiOutlineHeart />
            </Link>
          )}
        </Styled.IconsBar>
      </Styled.InnerWrapper>

      <Styled.Nav>
        <Styled.Hamburger>
          <IoMenu />
        </Styled.Hamburger>
        <ul>
          {categories.map((category) => (
            <Link key={category.name} href={`/kategorie/${category.url_key}`}>
              <li>
                {category.name}
                {category.children.length > 0 && (
                  <Styled.SubMenu>
                    <ul>    
                      {category.children.map((subcat, index) => (
                        <li key={index}>
                          <Link href={`/kategorie/${category.url_key}/${subcat.url_key}`}>
                            <span>{subcat.name}</span>
                          </Link>

                          {/* tutaj do poprawy */}
                          {subcat?.categories?.map((item, index) => (
                            <p key={index}>
                              <Link href={item.url_path}>{item.name}</Link>
                            </p>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </Styled.SubMenu>
                )}
              </li>
            </Link>
          ))}
        </ul>
      </Styled.Nav>
    </Styled.Wrapper>
  );
};
