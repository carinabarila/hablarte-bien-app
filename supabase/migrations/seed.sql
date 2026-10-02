-- ============================================================================
-- Hablarte Bien — Seed de datos
-- 1 módulo · 12 contextos · 75 guiones (4 pasos nativos por guion)
-- Ejecutar DESPUÉS de schema.sql en un proyecto Supabase limpio.
-- ============================================================================

TRUNCATE public.scripts, public.contexts, public.modules RESTART IDENTITY CASCADE;

-- MODULE
INSERT INTO public.modules (title, description) VALUES (
  'Hablarte Bien — Volumen 1',
  'Sistema interactivo de autocompasión basado en el libro de Lic. Carina Barilá.'
);

-- CONTEXTS
INSERT INTO public.contexts (module_id, name, page_reference) VALUES
  (1, 'Error', 27),
  (1, 'Comparación', 39),
  (1, 'Procrastinación', 47),
  (1, 'Ansiedad física', NULL),
  (1, 'Descanso y culpa', NULL),
  (1, 'Límites difíciles', 85),
  (1, 'Redes y opiniones', 93),
  (1, 'Pareja y vínculos', NULL),
  (1, 'Cuidadora', 109),
  (1, 'Dinero', NULL),
  (1, 'Rendimiento y estudio', NULL),
  (1, 'Trabajo y proyectos', 57);

-- SCRIPTS

-- Error (context_id=1)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (1, '“Otra vez la pifiaste. No aprendés más.”', '“Sí, cometí un error. Y eso me hace sentir vergüenza. Reconozco que cada error es parte del camino de aprender. Y aunque duele, eso no borra todas las demás cosas que sí funcionan. Me acompaño y trato con apoyo”', 'Humildad / aprendizaje', '“Estoy aprendiendo, incluso cuando cometo un error. Esto no me hace ser ”el error”'),
  (1, '“Con ese error, quedaste como una inútil.”', '“Un error no define quién soy. Soy mucho más que este momento puntual. Mi valor no se mide en un solo paso.”', 'Dignidad / autovalía', '“Soy más que mis errores.”'),
  (1, '“A esta altura, deberías haberlo hecho perfecto.”', '“La perfección es imposible. Lo que hice hoy fue lo mejor que pude con lo que tenía. Y eso alcanza.”', 'Autoaceptación / suficiencia', '“Lo suficiente también vale.”'),
  (1, '“No podés equivocarte, siempre quedás mal.”', '“Equivocarse es normal. Este tropiezo no borra mi camino.”', 'Humanidad compartida', '“No estoy sola en mis errores. Esto me hace humana”'),
  (1, '“Si me equivoco, tengo que exigirme el doble o ser más dura conmigo.”', '“Castigarme no me enseña, solo me lastima. Lo que realmente me ayuda es aprender con amabilidad.”', 'Amabilidad / aprendizaje real', '“La compasión enseña mejor que el látigo.”'),
  (1, '“Ya arruinaste todo. No tiene arreglo.”', '“Esto no es el final. Todavía puedo reparar, ajustar, volver a intentar. Nada está totalmente perdido.”', 'Esperanza / resiliencia', '“Siempre hay otra oportunidad. Esta es una oportunidad de aprendizaje.”');

-- Comparación (context_id=2)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (2, '“Mirá cómo los demás avanzan….”', '“Cada uno está en su propio viaje vital. Lo que hacen los demás les pertenece a ellos, con su historia y su contexto. Mi camino tiene valor, aunque avance a otro ritmo.”', 'Ecuanimidad / paciencia / presencia', '“Estoy en mi propio viaje, y eso merece respeto.”'),
  (2, '“Mirá cómo los demás avanzan… vos quedas siempre atrás.”', '“Es verdad, otros avanzan a su ritmo. Y yo también tengo el mío, que merece respeto. Mi valor no depende de ir más rápido o de lo que hagan los demás”', 'Paciencia / autoaceptación', '“Estoy en mi propio viaje, y eso merece respeto. Mi ritmo también cuenta”'),
  (2, '“Nunca vas a ser tan buena como ella/él.”', '“No necesito ser como nadie más. Mi camino es único y valioso por lo que soy, no en comparación con los demás.”', 'Autenticidad /autovalía', '“No necesito imitar para tener valor.”'),
  (2, '“Siempre quedás atrás, nunca vas a destacar.”', '“No todo se trata de destacar. Se trata de sostenerme, aprender y vivir mi proceso.”', 'Autocompasión', '“Elijo enfocarme, sostenerme, no competir.”'),
  (2, '“Los demás lo hacen mejor. Vos nunca vas a alcanzar ese nivel.”', '“Puedo elegir inspirarme en los demás, en lugar de hundirme en la comparación. Lo de otros no borra lo mío.”', 'Curiosidad / apertura', '“Hoy elijo inspirarame en los procesos de otros, no aplastarme.”'),
  (2, '“Si fueras más inteligente, estarías como ellos.”', '“La inteligencia no se mide en logros inmediatos. Tengo recursos propios que también cuentan. Estoy creciendo a mi manera.”', 'Confianza / gratitud por lo propio', '“Mis recursos son válidos.”'),
  (2, '“No sos suficiente comparada con los demás.”', '“Soy suficiente tal como soy, aunque no sea perfecta. La comparación solo me roba energía.”', 'Autocompasión', '“Soy suficiente en este momento, tal y como soy. Sostengo todas mis partes”');

-- Procrastinación (context_id=3)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (3, '“Siempre dejás todo para último momento. Sos un desastre.”', '“No soy un desastre: estoy evitando porque me da miedo fallar. Puedo empezar con un paso pequeño, aunque no sea perfecto.”', 'Coraje amable', '“Un paso hoy vale más que mil planes mañana.” “Dando esos pequeños pasos voy haciendo mi camino”'),
  (3, 'Mirá la hora. No vas a llegar. Otra vez perdiste el día.', '“El tiempo que pasó, pasó. Lo que sí puedo hacer es elegir un primer paso ahora, incluso uno pequeño.”', 'Presencia / compasión', 'Ahora también es un buen momento para empezar.'),
  (3, '“Si no lo hacés de una, mejor no lo hagas.”', '“No necesito hacerlo todo de golpe. Puedo avanzar en partes. Lo pequeño también cuenta.”', 'Constancia / paciencia', '“Un 1% hoy también es progreso.” “El desierto esta hecho de granitos de arena”'),
  (3, '“Si no te sentís motivada, no vas a poder.”', '“No necesito motivación para empezar. A veces la motivación aparece después de la acción.”', 'Presencia / perseverancia', '“Es la experiencia directa la que me va a orientar. La acción imperfecta abre el camino.”'),
  (3, '“Estás perdiendo oportunidades por tu flojera.”', '“No es flojera: es miedo y cansancio. El miedo a equivocarme y el cansancio de estar pensando, en alerta. Ahora puedo elegir cuidarme y avanzar de un modo más amable.”', 'Autenticidad / compasión', '“Reconocer mis miedos me libera para actuar.”'),
  (3, '“Nunca vas a terminar nada. Sos incapaz.”', '“Eso no suma. He terminado muchas cosas antes, y puedo volver a hacerlo. Un comienzo hoy me acerca a un final posible.”', 'Confianza / toma de perspectiva', '“Ya terminé cosas antes, y puedo hacerlo otra vez. Confio en el proceso.”');

-- Ansiedad física (context_id=4)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (4, '“Otra vez con esta sensación, no deberías estar sintiendote así. Deberias ser mas fuerte”', '“Mi cuerpo no está fallando, está intentando protegerme. Estas sensaciones no son un error, son respuestas normales ante una amenaza percibida. Puedo reconocer que estoy a salvo y acompañarme en vez de pelear con esto.”', 'Aceptación / curiosidad / bondad', '“Mi cuerpo intenta cuidarme, y yo lo cuido a él”'),
  (4, '“Si se nota que tenes ansiedad, van a pensar que sos débil.”', '“La ansiedad es parte de ser humana. No es debilidad, es un sistema que todos tenemos. No necesito avergonzarme de sentir.”', 'Humanidad compartida', '“La ansiedad me hace humana, no es una falla personal.”'),
  (4, '“Esto no se va a pasar, te vas a quedar así para siempre.”', '“Las sensaciones son como olas: vienen y se van. Puedo quedarme con esta ola, respirando suave, hasta que pase. Soy el contenedor de las experiencias”', 'Paciencia / confianza', '“Todo está en continuo movimiento, esto también va a pasar.”'),
  (4, '“No podés controlarte, estás fuera de control”', '“No necesito controlar una respuesta normal para estar conmigo. Puedo elegir soltar la lucha y acompañarme con mi presencia, respirando una respiración consciente a la vez', 'Autoapoyo', '“Me sostengo aunque me sienta fuera de control.”'),
  (4, '“Tenés que calmarte ya, si no esto se pone peor. No podes sentir esto tan fuerte”', '“No necesito obligarme a calmarme. Lo que necesito es dar espacio a lo que siento, sin juicio. La calma llega cuando dejo de presionarme.”', 'Apertura / amabilidad', '“Puedo dar espacio a lo que siento, aunque se sienta incómodo”'),
  (4, '“No vas a poder trabajar ni rendir si te sentís así.”', '“Puedo hacer cosas incluso sintiéndome ansiosa. La ansiedad no me impide actuar con pequeños pasos hacia lo que me importa. No soy mis sensaciones fisicas.”', 'Flexibilidad', '“Soy mucho más que esta sensación. Soy el contenedor de todas las experincias y sensaciones”'),
  (4, '“Estás exagerando. No deberías sentir esto.”', '“Hola juicio. Sé que aparecés porque tenés miedo de que me frene el malestar. Sentir no es un error, es parte de estar viva. Puedo dejar que esto esté acá, sin juzgarme.”', 'Autoaceptación', '“Mis sentimientos son validos”');

-- Descanso y culpa (context_id=5)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (5, '“Estás perdiendo el tiempo, tendrías que estar haciendo cosas, siendo productiva.”', '“Descansar no es perder tiempo. Mi cuerpo y mi mente también necesitan pausas para sostenerse. Cuidarme me ayuda a rendir mejor después.”', 'Autocuidado / autocompasión', '“Descansar también es avanzar.”'),
  (5, '“Sos vaga, por eso te acostaste.”', '“No soy vaga: soy humana. Mi cuerpo necesita recuperar energía, y está bien escucharlo.”', 'Autocuidado / Autorrespeto', '“Escuchar mi cuerpo es un acto de sabiduría.”'),
  (5, '“No podes parar ahora, si no, nunca vas a llegar.”', '“Parar no me aleja de mis metas, me sostiene para llegar sin romperme. Prefiero avanzar lento y firme, que rápido y agotada.”', 'Perseverancia amable', '“Elijo sostener mi camino, no quemarme en él.”'),
  (5, '“Deberías poder seguir sin parar.”', '“Seguir sin parar solo me hace actuar en círculos. El descanso no es debilidad, es parte de la fuerza que necesito.”', 'Fortaleza', '“Descansar me da la fuerza de seguir.”'),
  (5, '“Estás fallando porque no podés con todo, sos debil.”', '“Reconocer y honrar mis limites no es debilidad. Respetar mis límites es sabiduría, no falla.”', 'Sabiduría /coraje', 'Reconocer mis límites y honrar mis limites es un acto de cuidado sabio.”'),
  (5, '“El descanso es un lujo que no te podés permitir.”', '“El descanso no es un lujo: es una necesidad básica. Si me niego esto, me niego la posibilidad de sostenerme.”', 'Sabiduría / autocuidado', '“Descansar es una necesidad legítima.”');

-- Límites difíciles (context_id=6)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (6, '“Si decís que no, vas a decepcionar y no te van a tener en cuenta en el futuro.”', '“Decir no necesariamente significa decepcionar: significa ser honesta con mis recursos y elecciones Quien me aprecia puede aceptar mis límites.”', 'Honestidad / autocuidado', '“Decir no también es cuidarme”'),
  (6, '“Sos egoísta por poner tu necesidad primero.”', '“No es egoísmo, es salud. Si me cuido, puedo estar disponible de manera más auténtica para los demás.”', 'Equilibrio / autocuidado', '“Cuidarme me permite cuidar mejor.”'),
  (6, '“Deberías que poder con todo, no deberías necesitar un límite.”', '“Los límites no muestran incapacidad, muestran sabiduría. Reconocer hasta dónde puedo me hace más fuerte, no menos.”', 'Sabiduría /fortaleza', '“Un límite también es fuerza.”'),
  (6, '“Si decís que no, te van a dejar de querer.”', '“El afecto real no depende de mi rendimiento ni de decir siempre que sí. El que me quiere de manera genuina, entiende y respeta mis límites. Eso empieza ahora al poder practicarlo”', 'Dignidad / confianza en los vínculos', '“El amor se sostiene con respeto, no con complacencia.”'),
  (6, '“Si decís que no, perdés la oportunidad para siempre.”', '“No todas las oportunidades son las que necesito. A veces decir no es abrir espacio para algo mejor y más sostenible.”', 'Libertad', '“Decir no también abre espacio.”'),
  (6, '“Si ponés un límite, van a pensar mal de vos.”', '“No puedo controlar lo que otros piensan. Lo que sí puedo cuidar es la forma en que me trato y me sostengo.”', 'Coraje /flexibilidad', '“Elijo cuidar lo que depende de mí.”');

-- Redes y opiniones (context_id=7)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (7, '“Mirá lo que logran los demás, estan en buena forma y son felices. Vos nunca vas a estar a esa altura. No se te ocurra subir esta foto”', '“Lo que se muestra en redes es un recorte de la realidad. Ni mejor ni peor. Tan solo una parte. Puedo subir esta foto si quiero compartir, mas alla de los que este subiendo otra gente.”', 'Autenticidad', '“Mi proceso también merece respeto Hoy elijo compartir una parte de eso con valentía.”'),
  (7, '“Si no publicás seguido, la gente se va a olvidar de vos.”', '“No soy likes ni métricas. Mi presencia se sostiene en lo que aporto, desde el lugar que elijo hacerlo, no en lo que muestro.”', 'Confianza /flexibilidad', '“Mi valor no depende de estadísticas.”'),
  (7, '“Lo que escribiste no es tan bueno como lo de ellos.”', '“No necesito compararme para validar lo que aporto. Mi voz suma algo único que nadie más puede dar: mi propia presencia.”', 'Autenticidad', '“Mi voz es suficiente tal como es.”'),
  (7, '“Si te critican, significa que no servís.”', '“La crítica no define quién soy. Puedo escuchar lo útil y constructivo para seguir aprendiendo y soltar lo que no me aporta.”', 'Sabiduría', '“Puedo separar lo que me aporta de lo que no.”'),
  (7, '“Cuidado con lo que decis. Si no caés bien, perdiste.”', '“No puedo gustarle a todo el mundo. Prefiero ser honesta y auténtica que agradar a costa de mí propia autenticidad.”', 'Autenticidad', '“No necesito agradar para valer.”'),
  (7, '“Si te comparan con otros, siempre salís perdiendo. No decis cosas interesantes”', '“La comparación es un juego sin fin. Lo que me da fuerza es enfocarme en mi propio camino.”', 'Presencia', '“Elijo enfocarme en mi camino y expresarme.”');

-- Pareja y vínculos (context_id=8)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (8, '“No sos suficiente para esta relación.”', 'El amor no se trata de ser perfecta, sino de presencia y conexión. Soy suficiente como soy, con mis luces y mis sombras.”', 'Amor propio', '“Soy suficiente para dar y recibir amor.”'),
  (8, '“Si mostrás lo que sentís, te van a dejar.”', '“La vulnerabilidad no destruye los vínculos, los fortalece. Puedo ser honesta sin tener que ocultarme.”', 'Autenticidad / confianza', '“Mostrarme también es un acto de amor.”'),
  (8, '“Si decís lo que pensás, te van a rechazar. No sos interesante”', '“El respeto genuino incluye escuchar diferencias. Puedo expresarme con amabilidad.”', 'Valentía', '“Mi voz importa y también merece espacio.”'),
  (8, '“Nadie te va a querer si no cambiás”', '“El amor real no exige que deje de ser quien soy. Puedo crecer y mejorar sin atacarme ni negarme.”', 'Flexibilidad /Autorrespeto', '“Soy digna de amor tal y como soy.”'),
  (8, '“No podes tener una relación si no bajás de peso. Nadie te va a aceptar con este cuerpo”', '“El amor real no depende de encajar en un molde de apariencia. Puedo elegir cuidar mi cuerpo desde el respeto, no desde el rechazo. Soy más que mi imagen, y merezco afecto tal como soy hoy.', 'Flexibilidad /Autorrespeto', '“Mi cuerpo es digno de amor tal como es.'),
  (8, '“Si tuviera otra edad, talla o aspecto, recién ahí sería suficiente.”', '“No necesito esperar a cambiar para vivir. Mi valor no está en cumplir un estándar externo, sino en cómo me sostengo y me muestro con autenticidad.”', 'Autenticidad /Autorrespeto', '“Soy suficiente en este momento, como sea que me encuentre”'),
  (8, '“No puedo usar ropa ajustada, ni mostrar los brazos. Si me ven fisicamente tal como soy, me van a rechazar”', '“No soy solo una apariencia. Quien me quiera de verdad va a querer también mi risa, mis ideas, mi forma de estar. No necesito esconderme ni pedirme permiso para ser yo.”', 'Autenticidad /Autorrespeto', '“Que pueda vivir desde la autenticidad, no desde la vergüenza.”');

-- Maternidad y cuidado (context_id=9)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (9, '“No sos una buena madre/cuidadora, siempre te falta algo.”', '“No necesito ser perfecta para cuidar bien. Soy suficiente con mi presencia y mi amor.”', 'Autorrespeto', '“Mi presencia vale más que la perfección.”'),
  (9, '“Tus hijos/seres queridos merecen a alguien mejor que vos. No alcanza, no sos suficiente para ellos”', '“No se trata de ser la ”mejor versión perfecta”. Cuidar es estar presente, con mis luces y mis sombras. Elijo hacerlo con compromiso, coraje y sin juicio, porque lo que entrego desde mi autenticidad también nutre y sostiene.', 'Autenticidad /Autorrespeto', '“Que pueda vivir desde la autenticidad, no desde la vergüenza.”'),
  (9, '“Si te cansás, y no estas motivada para compartir con tus seres queridos es porque no amás lo suficiente.”', '“Amar no significa no cansarse ni tener siempre ganas. El cansancio muestra que soy humana.', 'Humanidad compartida', '“Cuidar también cansa, a veces se siente la falta de motivación y sigue siendo amor.”'),
  (9, '“Quienes cuidan no deberían necesitar tiempo para sí mismas. Es prioridad atender a tu familia”', '“Cuidarme me permite cuidar mejor. El autocuidado es parte del cuidado, no lo contrario. Reconozco que me cuesta y decido incluirme en el circulo del cuidado. ”', 'Humanidad compartida / Autocuidado', '“Mi autocuidado también importa”'),
  (9, '“Si cometés errores, les vas a arruinar la vida. No te muestres vulnerable, solo mostra tu “buena” versión.”', '“Los errores no arruinan: enseñan resiliencia. Mostrar humanidad también les da un modelo real de vida.”', 'Humildad / Coraje', '“Equivocarse es humano y puede ser una experiencia de aprendizaje.”'),
  (9, '“Nunca hacés lo suficiente, deberías dar más.”', '“Estoy brindando, aunque a veces no lo pueda reconocer o piense que no es suficiente. Mi amor y esfuerzo cuentan, incluso cuando no son infinitos o me cueste verlos.”', 'Autoaceptación', '“Lo que brindo tiene valor porque estoy cuidando desde mi presencia amorosa”');

-- Dinero (context_id=10)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (10, '“No ganás lo suficiente, nunca vas a estar bien, deberias haber progresado. Hay algo malo en vos”', '“Mi valor no se mide en números. El dinero importa, pero no define quién soy.”', 'Autoaceptación', '“Mi valor no depende de mi salario.”'),
  (10, '“Deberías cobrar menos, no valés tanto.”', '“Mi trabajo tiene valor y merece retribución justa. Cobrar con dignidad no es abuso, es respeto por mí y por lo que doy.”', 'Autorrespeto', '“Mi trabajo merece ser retribuido con un valor justo”'),
  (10, '“Nunca vas a poder organizarte con la plata.”', '“Estoy aprendiendo a gestionar mis gastos e ingresos paso a paso. No necesito hacerlo perfecto para mejorar.”', 'Paciencia / presencia', '“Puedo aprender de a poco a ordenarme.”'),
  (10, '“Todos tienen más que vos, estás quedando atrás.”', '“La comparación económica me quita paz y me drena la energía. Mi camino es mío, con mis ritmos y elecciones. Me enfoco en mi camino”', 'Autenticidad / presencia', '“Elijo mirar mi proceso, no el de otros.”'),
  (10, '“Si no generás más, sos un fracaso.”', '“El dinero no define quien soy yo. Mi impacto, mis vínculos y mi crecimiento también cuentan.”', 'Toma de perspectiva / autoaceptación', '“Mi éxito o fracaso es más amplio que un número.”'),
  (10, '“Nunca vas a poder con esto.”', '“Una parte mía duda, puedo reconocerlo. Al mismo tiempo, sé que puedo avanzar de a pasos pequeños. No necesito hacerlo todo hoy.”', 'Confianza', '“Hoy valoro lo que he logrado y avanzo hacia lo que necesito”');

-- Rendimiento y estudio (context_id=11)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (11, '“Nunca vas a poder con esto.”', '“Una parte mía duda, y puedo reconocerlo. Al mismo tiempo, sé que puedo avanzar de a pasos pequeños. No necesito hacerlo todo hoy.”', 'Perseverancia', '“Avanzar de a pasos pequeños también es avanzar.”'),
  (11, '“Hay algo malo en vos. Parece como que no entendes nada”', '“No hay nada malo en mí… salvo la idea de que hay algo malo. Soy humana: aprendo,me equivoco, aprendo y continuo.”', 'Humanidad compartida', '“Hoy me permito seguir creciendo, a mi propio ritmo.”'),
  (11, '“Si no podés, es porque sos débil.”', '“Necesitar ayuda o pausa no es debilidad: es parte del rendimiento sostenible.”', 'Autocuidado', 'Puedo cuidar mi mente y mi cuerpo sin atacarlos.”'),
  (11, '“No aprendés lo bastante rápido. Sos lenta.”', '“Aprender no es una carrera: es un proceso. Mi ritmo también merece respeto. Lo importante es la constancia.”', 'Confianza', '“Puedo avanzar a mi ritmo y seguir creciendo.”'),
  (11, '“Eso que hiciste no es suficientemente bueno. Podía haber sido mejor.”', 'Hice lo que pude con los recursos y el tiempo que tenía. El trabajo perfecto no existe, y esperar a que lo sea me paraliza. Entregar algo real vale más que no entregar nada.', 'Valentía / Aceptación', '“Lo que entregué hoy es suficiente para hoy.”'),
  (11, '“Los demás entienden todo a la primera. Vos siempre necesitás más tiempo.”', 'Cada persona aprende a su propio ritmo, y eso no dice nada de mi valor ni de mi capacidad. Necesitar más tiempo no es un déficit, es mi proceso. Lo que importa es que sigo.', 'Paciencia / Humanidad compartida', '“Mi ritmo de aprendizaje es válido.”');

-- Trabajo y proyectos (context_id=12)
INSERT INTO public.scripts (context_id, voz_critica, respuesta_compasiva, valor_asociado, anclaje) VALUES
  (12, '“No fue suficiente, tendrías que haber hecho más.”', '“Hoy entregué lo que pude con los recursos que tenía. La perfección no existe, y el esfuerzo que puse también cuenta.”', 'Autoaceptación', '“Lo que entregué hoy es suficiente.”'),
  (12, '“Con este resultado quedás mal, van a pensar que no servís.”', '“Un entregable no define todo mi valor profesional. La forma en que me sostengo a largo plazo importa más que impresionar en un momento.”', 'Flexibilidad', '“Soy más que un proyecto puntual.”'),
  (12, '“No podés parar hasta que quede perfecto. Repasa todo una vez más”', '“Si espero a la perfección, nunca voy a terminar. Una versión real hoy vale más que una ideal que nunca entrego.”', 'Flexibilidad / presencia', '“Lo real también tiene valor. Me permito aprender desde la experiencia directa. LLevo mi atención a los sonidos.”'),
  (12, '“Si descansás ahora, no vas a llegar.”', '“Un descanso breve me devuelve claridad y energía. La productividad no viene del látigo, viene del equilibrio.”', 'Autocuidado / sabiduría', '“El descanso me ayuda a tener claridad y rendir mejor. Roto los hombros y los bajo, suelto las tensiones de todo el cuerpo”'),
  (12, '“Te equivocaste en los detalles de la reunión, eso arruina todo.”', '“Un detalle no borra todo el valor de lo que logré. Puedo corregir lo que falta sin invalidar lo que ya hice.”', 'Toma de perspectiva / resiliencia', '“Mis logros no se anulan por un error.”'),
  (12, '“Todavía no es suficiente.”', '“Gracias mente. Estoy aprendiendo paso a paso. Podes descansar”', 'Confianza y apertura', '“Puedo respirar, volver al presente y recordar quién soy, no solo lo que logro.”');

-- Total: 1 módulo · 12 contextos · 75 guiones.