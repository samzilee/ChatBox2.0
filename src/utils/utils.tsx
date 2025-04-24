export type dataToBePostType =
  | {
      text: string;
      image: string;
    }
  | undefined;

export type loginFormData = {
  userName: string;
  email: string;
  password: string;
};
