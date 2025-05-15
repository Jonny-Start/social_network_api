import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./../config/database";

interface PostAttributes {
  id: number;
  userId: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PostInput extends Optional<PostAttributes, "id"> {}
export interface PostOutput extends Required<PostAttributes> {}

class Post extends Model<PostAttributes, PostInput> implements PostAttributes {
  public id!: number;
  public userId!: number;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "posts",
  }
);

export default Post;
