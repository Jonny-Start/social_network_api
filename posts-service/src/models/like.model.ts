import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./../config/database";
import Post from "./post.model";

interface LikeAttributes {
  id: number;
  postId: number;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LikeInput extends Optional<LikeAttributes, "id"> {}
export interface LikeOutput extends Required<LikeAttributes> {}

class Like extends Model<LikeAttributes, LikeInput> implements LikeAttributes {
  public id!: number;
  public postId!: number;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Like.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "likes",
    indexes: [
      {
        unique: true,
        fields: ["postId", "userId"], // Asegura que un usuario solo pueda dar like una vez a una publicación
      },
    ],
  }
);

// Establecer relación con Post
Post.hasMany(Like, { foreignKey: "postId", as: "likes" });
Like.belongsTo(Post, { foreignKey: "postId" });

export default Like;
