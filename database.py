import psycopg2
from psycopg2 import pool
from config import DB_CONFIG

class DatabaseConnection:
    _connection_pool = None

    @classmethod
    def initialize_pool(cls):
        if cls._connection_pool is None:
            try:
                cls._connection_pool = pool.SimpleConnectionPool(
                    minconn=1,
                    maxconn=10,
                    **DB_CONFIG
                )
                print("Connection pool created successfully")
            except Exception as e:
                print(f"Error creating connection pool: {e}")
                raise

    @classmethod
    def get_connection(cls):
        if cls._connection_pool is None:
            cls.initialize_pool()
        return cls._connection_pool.getconn()

    @classmethod
    def return_connection(cls, connection):
        if cls._connection_pool is not None:
            cls._connection_pool.putconn(connection)

    @classmethod
    def close_all_connections(cls):
        if cls._connection_pool is not None:
            cls._connection_pool.closeall()
            print("All connections closed")

# Example usage:
if __name__ == "__main__":
    try:
        # Get a connection from the pool
        conn = DatabaseConnection.get_connection()
        cursor = conn.cursor()
        
        # Test the connection
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"PostgreSQL version: {version}")
        
        # Return the connection to the pool
        cursor.close()
        DatabaseConnection.return_connection(conn)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Close all connections when done
        DatabaseConnection.close_all_connections() 