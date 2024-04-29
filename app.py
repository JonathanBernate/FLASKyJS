# app.py
from flask import Flask, render_template, request, redirect, url_for
from flask import Flask, jsonify

import MySQLdb
import os
from werkzeug.utils import secure_filename
from config import Config

# Configurar la aplicación Flask
app = Flask(__name__)
app.config.from_object(Config)

# Configurar la conexión a MySQL
db = MySQLdb.connect(
    host=app.config['MYSQL_HOST'],
    user=app.config['MYSQL_USER'],
    passwd=app.config['MYSQL_PASSWORD'],
    db=app.config['MYSQL_DB']
)



# Ruta para el formulario
@app.route('/registro', methods=['GET', 'POST'])
def form():
    if request.method == 'POST':
        # Datos del primer usuario
        nombre = request.form['nombre']
        edad = request.form['edad']
        correo = request.form['correo']

        # Manejo de archivos de imagen para el primer usuario
        foto = request.files['foto']
        filename = secure_filename(foto.filename)
        filepath = os.path.join('static/images/', filename)
        foto.save(filepath)

        # Datos del segundo usuario
        nombre2 = request.form['nombre2']
        edad2 = request.form['edad2']
        correo2 = request.form['correo2']

        # Manejo de archivos de imagen para el segundo usuario
        foto2 = request.files['foto2']
        filename2 = secure_filename(foto2.filename)
        filepath2 = os.path.join('static/images/', filename2)
        foto2.save(filepath2)

        # Actualizar datos del primer usuario
        cursor = db.cursor()
        sql_update_1 = """
            UPDATE usuarios
            SET nombre = %s, edad = %s, correo = %s, foto = %s
            WHERE id_usuario = 1
        """
        try:
            cursor.execute(sql_update_1, (nombre, edad, correo, filename))
        except Exception as e:
            print("Error al actualizar el primer usuario:", e)

        # Actualizar datos del segundo usuario
        sql_update_2 = """
            UPDATE usuarios
            SET nombre = %s, edad = %s, correo = %s, foto = %s
            WHERE id_usuario = 2
        """
        try:
            cursor.execute(sql_update_2, (nombre2, edad2, correo2, filename2))
        except Exception as e:
            print("Error al actualizar el segundo usuario:", e)

        db.commit()

        return redirect(url_for('triki'))  # Redirigir después de agregar datos

    return render_template('form.html')


@app.route('/jugadores')
def jugadores():
    return render_template('form.html')

@app.route('/triki')
def triki():
    return render_template('triki.html')


@app.route('/podio')
def podio():
    return render_template('podio.html')


@app.route('/configuracion')
def configuracion():
    return render_template('configuracion.html')


@app.route('/save_result', methods=['POST'])
def save_result():
    data = request.get_json()

    if data is None or 'ganador' not in data:
        return jsonify({"error": "Datos incorrectos o faltantes"}), 400

    winner = data.get("ganador")
    cursor = db.cursor()

    # Asegúrate de que la tabla y el campo existen
    try:
        sql = "INSERT INTO ganador (ganador) VALUES (%s)"
        cursor.execute(sql, (winner,))
        db.commit()  # Importante cerrar la transacción

        return jsonify({"message": "Resultado guardado"}), 200
    except mysql.connector.Error as err:
        # Manejo de errores de base de datos
        return jsonify({"error": f"Error al guardar en la base de datos: {err}"}), 500

@app.route('/count_p1_p2', methods=['GET'])
def count_p1_p2():
    cursor = db.cursor()

    try:
        # Contar cuántos registros hay para 'P1'
        cursor.execute("SELECT COUNT(*) FROM ganador WHERE ganador = 'P1'")
        total_P1 = cursor.fetchone()[0]  # Obtener el resultado para 'P1'

        # Contar cuántos registros hay para 'P2'
        cursor.execute("SELECT COUNT(*) FROM ganador WHERE ganador = 'P2'")
        total_P2 = cursor.fetchone()[0]  # Obtener el resultado para 'P2'

        # Devolver el resultado como JSON
        return jsonify({
            "total_P1": total_P1,
            "total_P2": total_P2
        }), 200
    except mysql.connector.Error as err:
        # Manejo de errores en caso de problemas con la base de datos
        return jsonify({"error": f"Error al obtener datos de la base de datos: {err}"}), 500


# Ruta principal
@app.route('/')
def index():
    return render_template('form.html')

# Ruta para obtener todos los datos de la tabla 'usuarios'
@app.route('/usuarios', methods=['GET'])
def get_usuarios():
    try:
        cursor = db.cursor(MySQLdb.cursors.DictCursor)  # Usar DictCursor para obtener resultados como diccionarios
        sql = "SELECT * FROM usuarios"
        cursor.execute(sql)
        usuarios = cursor.fetchall()  # Obtener todos los resultados
        return jsonify(usuarios)  # Devolver como JSON
    except Exception as e:
        # Manejar errores y devolver una respuesta clara
        return jsonify({"error": str(e)}), 500


@app.route('/tiempo', methods=['GET'])
def get_tiempo():
    try:
        cursor = db.cursor(MySQLdb.cursors.DictCursor)  # Usar DictCursor para obtener resultados como diccionarios
        sql = "SELECT * FROM tiempo"  # Consultar todos los datos de la tabla 'tiempo'
        cursor.execute(sql)
        tiempos = cursor.fetchall()  # Obtener todos los resultados de la consulta
        return jsonify(tiempos)  # Devolver datos en formato JSON
    except Exception as e:
        # Manejar errores y devolver una respuesta clara
        return jsonify({"error": str(e)}), 500  # Devolver error con código HTTP 500 si ocurre un problema
    

    
@app.route('/update_tiempo', methods=['POST'])
def update_tiempo():
    data = request.get_json()  # Obtener los datos JSON enviados desde el front-end

    if data is None or 'tiempo_restante' not in data:
        return jsonify({"error": "Datos incorrectos o faltantes"}), 400  # Manejo de errores por datos faltantes

    tiempo_restante = data['tiempo_restante']  # Obtener el valor del tiempo ingresado
    cursor = db.cursor()

    try:
        sql = "UPDATE tiempo SET tiempo = %s"  # Asegúrate de que la tabla y el campo existen
        cursor.execute(sql, (tiempo_restante,))
        db.commit()  # Confirmar la transacción

        return jsonify({"message": "Tiempo actualizado"}), 200  # Respuesta exitosa
    except MySQLdb.Error as err:  # Manejo de errores en MySQL
        return jsonify({"error": f"Error al actualizar la base de datos: {err}"}), 500  # Error interno


@app.route('/clear_ganador', methods=['DELETE'])
def clear_ganador():
    try:
        cursor = db.cursor()  # Iniciar el cursor para la conexión con la base de datos
        # Eliminar todos los registros de la tabla 'ganador'
        cursor.execute("DELETE FROM ganador")
        db.commit()  # Confirmar la transacción
        return jsonify({"message": "Datos eliminados con éxito"}), 200
    except MySQLdb.Error as err:  # Manejo de errores en MySQL
        return jsonify({"error": f"Error al eliminar datos: {err}"}), 500  # Respuesta con error en caso de falla


if __name__ == '__main__':
    app.run(debug=True)
