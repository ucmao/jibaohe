from flask import Blueprint, request, jsonify
from configs.logging_config import logger
from configs.general_constants import BASE_URL, get_db_connection

bp = Blueprint('users', __name__)


@bp.route('/update', methods=['POST'])
def user_update():
    data = request.get_json()
    openid = data.get('openid')
    username = data.get('username')
    avatar = data.get('avatar')

    if not openid:
        return jsonify({'error': 'openid is required'}), 400

    # 处理 avatar：从完整 URL 提取 static 后的路径
    if avatar and isinstance(avatar, str):
        base = BASE_URL.rstrip('/')
        full_static_prefix = base + '/static/'
        if avatar.startswith(full_static_prefix):
            avatar = avatar[len(full_static_prefix):]
        else:
            logger.warning(f"Invalid avatar URL format from user {openid}: {avatar}")
            return jsonify({'error': 'Avatar URL must be under your static domain'}), 400

    connection = None
    try:
        connection = get_db_connection()
        sql = """
            UPDATE users
            SET username = ?, avatar = ?
            WHERE openid = ?
        """
        cursor = connection.execute(sql, (username, avatar, openid))
        affected_rows = cursor.rowcount
        connection.commit()

        if affected_rows > 0:
            logger.info(f"User {openid} updated successfully")
            return jsonify({'message': 'User updated successfully'}), 200
        else:
            logger.warning(f"Update failed: user with openid {openid} not found")
            return jsonify({'error': 'User not found'}), 404

    except Exception as e:
        logger.error(f"Error in user_update: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if connection:
            connection.close()
