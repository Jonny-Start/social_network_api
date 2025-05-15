import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface ProfileAttributes {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  alias: string;
  birthDate: Date;
  email: string; // Para mostrar en el perfil, no para autenticación
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProfileInput extends Optional<ProfileAttributes, "id"> {}
export interface ProfileOutput extends Required<ProfileAttributes> {}

class Profile
  extends Model<ProfileAttributes, ProfileInput>
  implements ProfileAttributes
{
  public id!: number;
  public userId!: number;
  public firstName!: string;
  public lastName!: string;
  public alias!: string;
  public birthDate!: Date;
  public email!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Profile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    sequelize,
    tableName: "profiles",
  }
);

export default Profile;
