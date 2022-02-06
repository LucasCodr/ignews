import {NextApiRequest, NextApiResponse} from "next";

export default function(req: NextApiRequest, res: NextApiResponse) {
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "johndoe@john.com"
    },
    {
      id: "2",
      name: "Jane Doe",
      email: "johndoe@john.com"
    },
    {
      id: "3",
      name: "John Doe",
      email: "johndoe@john.com"
    }
  ]
  
  return res.json(users);
}