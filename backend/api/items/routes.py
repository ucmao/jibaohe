from flask import Blueprint, request, jsonify
import os
from configs.logging_config import logger
from configs.general_constants import ICONS_DIR, BASE_URL, get_db_connection

# 创建蓝图
bp = Blueprint('items', __name__)


# 工具函数：将完整 URL 转为相对路径（如果匹配 BASE_URL）
def extract_relative_path(full_url):
    static_prefix = f"{BASE_URL}/static/"
    if full_url and full_url.startswith(static_prefix):
        return full_url[len(static_prefix):]
    return full_url


# 工具函数：将相对路径转为完整 URL
def build_full_url(relative_path):
    if not relative_path:
        return None
    if relative_path.startswith("http"):
        return relative_path
    return f"{BASE_URL}/static/{relative_path}"


# 获取所有分类及其图标
@bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        if not os.path.exists(ICONS_DIR):
            logger.error(f"Icons directory not found: {ICONS_DIR}")
            return jsonify({'error': 'Icons directory not found'}), 404
        categories = os.listdir(ICONS_DIR)
        categories_data = {}
        for category in categories:
            category_path = os.path.join(ICONS_DIR, category)
            if os.path.isdir(category_path):
                icons = [f for f in os.listdir(category_path) if f.endswith('.png')]
                icon_urls = [f"{BASE_URL}/static/icons/{category}/{icon}" for icon in icons]
                categories_data[category] = icon_urls
        return jsonify(categories_data), 200
    except Exception as e:
        logger.error(f"Error in get_categories: {e}")
        return jsonify({'error': str(e)}), 500


# 添加物品
@bp.route('/add_item', methods=['POST'])
def add_item():
    data = request.get_json()
    open_id = data.get('openid')
    category = data.get('category')
    item_image = data.get('item_image')
    item_name = data.get('item_name')
    purchase_date = data.get('purchase_date')
    purchase_price = data.get('purchase_price')
    use_count_value = data.get('use_count_value')
    daily_price = data.get('daily_price')
    retirement_date = data.get('retirement_date')
    retirement_price = data.get('retirement_price')
    description = data.get('description')
    is_favorite = data.get('is_favorite', False)

    if not open_id or not item_name:
        return jsonify({'error': 'open_id and item_name are required'}), 400

    if item_image:
        item_image = extract_relative_path(item_image)

    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.execute("SELECT id FROM users WHERE openid = ?", (open_id,))
        user_result = cursor.fetchone()

        if not user_result:
            return jsonify({'error': 'User not found'}), 404

        user_id = user_result['id']

        sql_insert_item = """
            INSERT INTO items (
                user_id, category, item_image, item_name, purchase_date, purchase_price,
                description, is_favorite, use_count_value, daily_price, retirement_date, retirement_price
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor = connection.execute(sql_insert_item, (
            user_id, category, item_image, item_name, purchase_date, purchase_price,
            description, is_favorite, use_count_value, daily_price, retirement_date, retirement_price
        ))
        item_id = cursor.lastrowid
        connection.commit()
    except Exception as e:
        logger.error(f"Error in add_item: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if connection:
            connection.close()

    logger.info(f"{item_id} Item added successfully")
    return jsonify({'message': 'Item added successfully', 'item_id': item_id}), 201


# 获取用户的所有物品
@bp.route('/user/<string:openid>', methods=['GET'])
def get_user_items_by_openid(openid):
    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.execute("SELECT id FROM users WHERE openid = ?", (openid,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        user_id = user['id']

        cursor = connection.execute("""
            SELECT * FROM items
            WHERE user_id = ? AND deleted_at IS NULL
        """, (user_id,))
        items = cursor.fetchall()

        items_list = []
        for item in items:
            items_list.append({
                'id': item['id'],
                'category': item['category'],
                'item_image': build_full_url(item['item_image']),
                'item_name': item['item_name'],
                'purchase_date': item['purchase_date'] if item['purchase_date'] else None,
                'purchase_price': float(item['purchase_price']) if item['purchase_price'] else None,
                'retirement_date': item['retirement_date'] if item['retirement_date'] else None,
                'retirement_price': float(item['retirement_price']) if item['retirement_price'] else None,
                'description': item['description'],
                'is_favorite': bool(item['is_favorite']),
                'use_count_value': item['use_count_value'],
                'daily_price': float(item['daily_price']) if item['daily_price'] else None,
                'created_at': item['created_at'],
                'updated_at': item['updated_at']
            })
    except Exception as e:
        logger.error(f"Error in get_user_items_by_openid: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if connection:
            connection.close()

    return jsonify(items_list), 200


# 更新物品信息
@bp.route('/item/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    data = request.get_json()
    update_fields = []
    update_values = []

    if 'item_image' in data:
        rel_path = extract_relative_path(data['item_image'])
        update_fields.append("item_image = ?")
        update_values.append(rel_path)

    field_map = {
        'category': 'category',
        'item_name': 'item_name',
        'purchase_date': 'purchase_date',
        'purchase_price': 'purchase_price',
        'use_count_value': 'use_count_value',
        'daily_price': 'daily_price',
        'retirement_date': 'retirement_date',
        'retirement_price': 'retirement_price',
        'description': 'description',
        'is_favorite': 'is_favorite'
    }

    for key, col in field_map.items():
        if key in data:
            if key == 'item_image':
                continue
            update_fields.append(f"{col} = ?")
            update_values.append(data[key])

    if not update_fields:
        return jsonify({'error': 'No fields to update'}), 400

    sql = f"UPDATE items SET {', '.join(update_fields)} WHERE id = ?"
    update_values.append(item_id)

    connection = None
    try:
        connection = get_db_connection()
        connection.execute(sql, update_values)
        connection.commit()
    except Exception as e:
        logger.error(f"Error in update_item: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if connection:
            connection.close()

    logger.info(f"{item_id} Item updated successfully")
    return jsonify({'message': 'Item updated successfully'}), 200


# 删除物品
@bp.route('/item/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    connection = None
    try:
        connection = get_db_connection()
        connection.execute("DELETE FROM items WHERE id = ?", (item_id,))
        connection.commit()
    except Exception as e:
        logger.error(f"Error in delete_item: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if connection:
            connection.close()

    logger.info(f"{item_id} Item deleted successfully")
    return jsonify({'message': 'Item deleted successfully'}), 200
