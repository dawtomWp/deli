import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import * as Styled from "./styles";
import { ModalContext } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { magentoRegister } from "../../graphql/magentoRegister";
import { Button } from "../Button";
import { ErrorMsg } from "../ErrorMsg";
import { Heading } from "../Heading";
import { Input } from "../Input";
import { magentoCreateCustomerAddress } from "../../graphql/magentoCreateCustomerAddress";
import { magentoCountryQuery } from "../../graphql/magentoCountryQuery";
import { Select } from "../Select";
import { RegisterConsents } from "../RegisterConsents";

const initialState = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  repassword: "",
};

const addressInitialState = {
  region: {
    region: "",
    region_id: "",
  },
  country_code: "",
  street: "",
  telephone: "",
  postcode: "",
  city: "",
  firstname: "",
  lastname: "",
};

const initialUserState = {
  email: "",
  password: "",
};

export const AuthForm = () => {
  const { userLogin, setAddresses, addresses } = useContext(UserContext);
  const { showModal } = useContext(ModalContext);
  const [newAccount, setNewAccount] = useState(initialState);
  const [newAddress, setNewAddress] = useState(addressInitialState);
  const [errors, setErrors] = useState({});
  const [errorsLogin, setErrorsLogin] = useState({});
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("PL");
  const [isRegister, setIsRegister] = useState(true);
  const [userForm, setUserForm] = useState(initialUserState);

  useEffect(() => {
    magentoCountryQuery(selectedCountry).then((res) =>
      setCountries(res.country)
    );
  }, [selectedCountry]);

  const handleChange = (e) => {
    setNewAccount({
      ...newAccount,
      [e.target.name]: e.target.value,
    });
    setNewAddress({
      ...newAddress,
      firstname: newAccount.firstname,
      lastname: newAccount.lastname,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginChange = (e) => {

    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationPass = validation(newAccount, newAddress);

    if (validationPass.status) {
      await magentoRegister(newAccount).then(async (res) => {
        setErrors({});
    
        if (res.status.message) {
          showModal("Użytkownik o podanym adresie email już istnieje", true);
          return;
        }
        await userLogin({
          email: newAccount.email,
          password: newAccount.password,
        });
        await magentoCreateCustomerAddress(newAddress, true, false).then(
          ({ response }) => {
  
            console.log(response, "RESP")
            setAddresses((prev) => [
              ...prev,
              response.data.createCustomerAddress,
            ]);
          }
        );
        await magentoCreateCustomerAddress(newAddress, false, true).then(
          ({ response }) =>
            setAddresses((prev) => [
              ...prev,
              response.data.createCustomerAddress,
            ])
        );

        // await magentoCreateCompany(newCompany).then(res => console.log(res, "NOWA FIREMKA"))
        showModal("Założono nowe konto");
      });
    } else {
      setErrors(validationPass.errors);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const validationPass = validationLogin(userForm);
    if (validationPass.status) {
      setErrorsLogin({});

      userLogin(userForm);
    }
    setErrorsLogin(validationPass.errorsLogin);
  };

  const validationLogin = (data) => {
    const errorsLogin = {};
    if (data.email == "") errorsLogin.email = "To pole jest wymagane";
    if (data.password == "") errorsLogin.password = "To pole jest wymagane";

    if (!errorsLogin.email && !errorsLogin.password)
      return {
        status: true,
        errorsLogin: null,
      };
    return {
      status: false,
      errorsLogin,
    };
  };

  const validation = (data, dataAddress, region) => {
    const passReg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    const errors = {};
    if (!data.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i))
      errors.email = "Niepoprawny adres email";
    if (!data.password.match(passReg)) {
      errors.password =
        "Wymagane co najmniej 6 znaków, w tym jedna duża litera i cyfra";
    }
    if (data.firstname == "") errors.firstname = "To pole jest wymagane";
    if (data.lastname == "") errors.lastname = "To pole jest wymagane";
    if (data.password !== data.repassword)
      errors.passwordCheck = "Hasła nie są identyczne";
    if (dataAddress.city == "") errors.city = "To pole jest wymagane";
    if (dataAddress.country_code == "")
      errors.country_code = "To pole jest wymagane";
    if (dataAddress.postcode == "") errors.postcode = "To pole jest wymagane";
    if (dataAddress.telephone == "") errors.telephone = "To pole jest wymagane";
    if (dataAddress.street == "") errors.street = "To pole jest wymagane";
    if (region == "") errors.region = "To pole jest wymagane";

    if (
      !errors.email &&
      !errors.password &&
      !errors.passwordCheck &&
      !errors.firstname &&
      !errors.lastname &&
      !errors.city &&
      !errors.country_code &&
      !errors.postcode &&
      !errors.telephone &&
      !errors.street &&
      !errors.region
    )
      return {
        status: true,
        errors: null,
      };

    return {
      status: false,
      errors,
    };
  };

  return (
    <Styled.Wrapper>
      <Heading>
        {isRegister ? "UTWÓRZ NOWE KONTO KLIENTA" : "ZALOGUJ SIĘ"}
      </Heading>
      <p>
        {isRegister ? "Masz już konto?" : "Nie masz konta?"}{" "}
        <Styled.AuthLink onClick={() => setIsRegister(!isRegister)}>
          {" "}
          {isRegister ? "Zaloguj się" : "Zarejestruj się"}
        </Styled.AuthLink>
      </p>
      {isRegister ? (
        <Styled.AuthWrapper onSubmit={handleSubmit}>
          <legend>
            <span>DANE DO LOGOWANIA</span>
          </legend>
          <Input
            value={newAccount.firstname}
            onChange={handleChange}
            type="text"
            placeholder="Imię"
            name="firstname"
          />
          {errors && <ErrorMsg>{errors?.firstname}</ErrorMsg>}
          <Input
            value={newAccount.lastname}
            onChange={handleChange}
            type="text"
            placeholder="Nazwisko"
            name="lastname"
          />

          <Input
            value={newAccount.email}
            onChange={handleChange}
            type="text"
            placeholder="E-mail"
            name="email"
          />
          {errors && <ErrorMsg>{errors.email}</ErrorMsg>}
          <Input
            value={newAccount.password}
            onChange={handleChange}
            type="password"
            placeholder="Hasło"
            name="password"
          />
          {errors && <ErrorMsg>{errors.password}</ErrorMsg>}
          <Input
            value={newAccount.repassword}
            onChange={handleChange}
            type="password"
            placeholder="Powtórz hasło"
            name="repassword"
          />
          {errors && <ErrorMsg>{errors.passwordCheck}</ErrorMsg>}

          <legend>
            <span>DANE DOSTAWY</span>
          </legend>

          <Input
            value={newAddress.street}
            name="street"
            type="text"
            placeholder="Ulica i numer"
            onChange={handleChange}
          />
          {errors && <ErrorMsg>{errors.street}</ErrorMsg>}

          <Input
            value={newAddress.city}
            name="city"
            type="text"
            placeholder="Miasto"
            onChange={handleChange}
          />
          {errors && <ErrorMsg>{errors.city}</ErrorMsg>}

          <Input
            value={newAddress.telephone}
            onChange={handleChange}
            type="text"
            placeholder="Telefon"
            name="telephone"
          />

          <Select name="region" onChange={handleChange}>
            <option value="">Wybierz województwo lub region</option>
            {countries.available_regions?.map((region) => (
              <option key={region.id} value={region.name}>
                {region.name}
              </option>
            ))}
          </Select>
          {errors?.region && <ErrorMsg>{errors.region}</ErrorMsg>}

          <Input
            name="postcode"
            value={newAddress.postcode}
            type="text"
            placeholder="Kod pocztowy"
            onChange={handleChange}
          />
          {errors && <ErrorMsg>{errors.postcode}</ErrorMsg>}

          <Select
            name="country_code"
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              handleChange(e);
            }}
          >
            <option value="PL">Wybierz kraj</option>
            <option value="PL">Polska</option>
          </Select>
          {errors.country_code && <ErrorMsg>{errors.country_code}</ErrorMsg>}

          <RegisterConsents />

          <Button isSecondary type="submit">
            UTWÓRZ KONTO KLIENTA
          </Button>
          <Button>
            <Link href="/">
              <a>POWRÓT</a>
            </Link>
          </Button>
        </Styled.AuthWrapper>
      ) : (
        <Styled.AuthWrapper onSubmit={handleLogin}>
          <legend>
            <span>DANE DO LOGOWANIA</span>
          </legend>
          <Input
            onChange={handleLoginChange}
            value={userForm.email}
            type="text"
            placeholder="Email"
            name="email"
          />
          {errorsLogin && <ErrorMsg>{errorsLogin.email}</ErrorMsg>}
          <Input
            onChange={handleLoginChange}
            value={userForm.password}
            type="password"
            placeholder="Password"
            name="password"
          />
          {errorsLogin && <ErrorMsg>{errorsLogin.password}</ErrorMsg>}
          <Button isSecondary type="submit">
            ZALOGUJ SIĘ
          </Button>
          <Button>
            <Link href="/">
              <a>POWRÓT</a>
            </Link>
          </Button>
        </Styled.AuthWrapper>
      )}
    </Styled.Wrapper>
  );
};
